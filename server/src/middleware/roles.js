// ▶️ requireRole(role): ovo je “čuvar vrata” za rute.
//    Kaže: “pusti dalje SAMO ako korisnik ima TAČNO ovu ulogu (role)”.
//    Primer: requireRole('ADMIN') – samo admin sme da uđe.
export function requireRole(role) {
  //   Vraćamo funkciju (middleware) koju Express poziva za svaku rutu.
  return (req, res, next) => {
    //   req.user je već postavio requireAuth ranije (tu smo proverili token).
    const user = req.user; // set by requireAuth

    //   Ako NEMA korisnika (nije ulogovan) ILI mu uloga NIJE tražena uloga,
    //    onda zabranjujemo pristup (HTTP 403 = Forbidden).
    if (!user || user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    //   Ako sve OK, zovi next() i pusti da ruta nastavi normalno.
    next();
  };
}
