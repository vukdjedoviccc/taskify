//   Uvozimo PrismaClient – “daljinski upravljač” za bazu podataka (čita/piše u MySQL).
import { PrismaClient } from '../../generated/prisma/index.js';
//   Pravimo jedan prisma objekat koji koristimo za sve upite ka bazi.
const prisma = new PrismaClient();

//   LISTANJE KORISNIKA (JAVNI ENDPOINT ZA ADMIN PANEL, uz auth u middleware-u)
//    Ruta: GET /api/users?page=&pageSize=&q=&role=
//    - page/pageSize: paginacija (koja stranica, koliko komada po stranici)
//    - q: tekst za pretragu po imenu ili emailu
//    - role: filtriranje po ulozi ("USER" ili "ADMIN")
export async function listUsers(req, res) {
  //   Uzimamo broj strane. Ako nije poslat ili je glup, stavljamo barem 1.
  const page = Math.max(1, Number(req.query.page) || 1);
  //   Koliko redova po strani. Ne damo preko 50, minimum 1. Podrazumevano 12.
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 12));
  //   'q' je tekst pretrage (trimovan da sklonimo razmake).
  const q = (req.query.q || '').toString().trim();
  //   'role' je uloga. Prebacujemo u velika slova da bude tačno ("USER"/"ADMIN").
  const role = (req.query.role || '').toString().trim().toUpperCase();

  //   Sastavljamo filter (WHERE) za bazu:
  //    - Ako postoji 'q', pretražujemo ime ili email koji SADRŽE 'q'.
  //    - Ako je role validna (USER ili ADMIN), filtriramo i po ulozi.
  const where = {
    ...(q
      ? {
          OR: [{ name: { contains: q } }, { email: { contains: q } }],
        }
      : {}),
    ...(role === 'USER' || role === 'ADMIN' ? { role } : {}),
  };

  //   Paralelno radimo dve stvari:
  //    1) Dohvatamo listu korisnika, sortiranu od najnovijeg ka starijem.
  //    2) Brojimo KOLIKO ukupno korisnika zadovoljava filter (za paginaciju).
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // najnoviji prvi
      skip: (page - 1) * pageSize,    // preskoči prethodne strane
      take: pageSize,                 // uzmi ovoliko redova
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { createdTasks: true, projectMembers: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  //   Vraćamo rezultat sa metapodacima o strani, ukupno itd.
  res.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}

//   DETALJI KORISNIKA PO ID-ju
//    Ruta: GET /api/users/:id
//    - Vraća osnovne podatke o korisniku i broj njegovih porudžbina.
//    - Ako ne postoji, vraća 404.
export async function getUserById(req, res) {
  //   ID uzimamo iz URL parametara i pretvaramo u broj.
  const id = Number(req.params.id);
  //   Tražimo korisnika po ID-ju i biramo samo polja koja su nam potrebna.
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { createdTasks: true, projectMembers: true } },
    },
  });
  //   Ako ga nema, pošalji 404 (nije pronađen).
  if (!user) return res.status(404).json({ message: 'User not found' });
  //   Inače, pošalji podatke o korisniku.
  res.json(user);
}

//   IZMENA ULOGE KORISNIKA (ADMIN AKCIJA)
//    Ruta: PATCH /api/users/:id/role
//    Body: { role: 'USER' | 'ADMIN' }
//    - Proveravamo da li je role validna, pa ažuriramo korisnika.
//    - Ako ID ne postoji, vraćamo 404.
export async function updateUserRole(req, res) {
  //   ID iz URL-a → broj.
  const id = Number(req.params.id);
  //   Uzimamo novu rolu iz tela zahteva.
  const { role } = req.body;

  //   Dozvoljavamo samo 'USER' ili 'ADMIN'. Ako je nešto treće → 400 (loš zahtev).
  if (!['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    //   Ažuriramo rolu korisnika i vraćamo osnovne podatke + broj porudžbina.
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { createdTasks: true, projectMembers: true } },
      },
    });
    //   Šaljemo nazad osveženog korisnika.
    res.json(user);
  } catch (e) {
    //   Prisma greška P2025 znači “nema takvog reda” → korisnik ne postoji.
    if (e.code === 'P2025')
      return res.status(404).json({ message: 'User not found' });
    //   Sve druge greške prijavi kao “server error”.
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
}
