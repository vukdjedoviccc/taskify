# Taskify - Task Management Application

Fullstack aplikacija za upravljanje projektima i taskovima sa **Kanban board-om**.
Kreirana korišćenjem **Angular 21 + Signals + TailwindCSS** na frontendu i **Node.js + Express 5 + Prisma + SQL Server** na backendu.

---

## Pregled

Taskify je moderna task management aplikacija koja omogućava timovima da organizuju svoj rad kroz:

- **Projekte** - Grupisanje taskova po projektima sa članovima tima
- **Kanban Board** - Vizuelni prikaz taskova sa drag & drop funkcionalnošću
- **Kolone** - Prilagodljive kolone (To Do, In Progress, Done, ili custom)
- **Taskovi** - Detaljni taskovi sa prioritetima i rokovima

---

## Funkcionalnosti

### Autentifikacija i Autorizacija

- Registracija i prijava korisnika
- JWT token čuvan u HTTP-only cookie-u (sigurnost)
- Pet nivoa pristupa: **ADMIN**, **USER**, **OWNER**, **MANAGER**, **MEMBER**
- Zaštićene rute na frontendu (Guards) i backendu (Middleware)
- Admin panel za upravljanje korisnicima

### Projekti

- Kreiranje projekata sa nazivom, opisom i bojom
- Pozivanje članova u projekat putem email-a
- Dodeljivanje rola članovima (Owner, Manager, Member)
- Arhiviranje projekata
- Pregled svih projekata korisnika

### Kanban Board

- **Drag & Drop** - Premestanje taskova između kolona (Angular CDK)
- Kreiranje custom kolona sa bojama
- Reordering kolona
- Responzivan dizajn za sve uređaje

### Taskovi

- Kreiranje i uređivanje taskova
- **Prioriteti**: Low, Medium, High, Urgent
- **Due dates** sa vizuelnim indikatorima (overdue, due soon)
- **Move** - Premeštanje taskova između kolona sa automatskim ažuriranjem pozicija

### Admin Panel

- Pregled svih korisnika sistema
- Promena uloga korisnika (USER/ADMIN)
- Pretraga i filtriranje korisnika

---

## Tehnologije

### Frontend (Angular 21)

| Tehnologija | Opis |
|-------------|------|
| **Angular 21** | Frontend framework sa standalone komponentama |
| **Angular Signals** | Reaktivno state management (signal, computed, input, output, model) |
| **Angular CDK** | Drag & Drop za Kanban board |
| **TailwindCSS** | Utility-first CSS framework |
| **ng-icons** | Feather icons za UI |
| **RxJS** | Reaktivno programiranje |

### Backend (Node.js)

| Tehnologija | Opis |
|-------------|------|
| **Node.js 20+** | JavaScript runtime |
| **Express 5** | Web framework |
| **Prisma ORM** | Database toolkit |
| **SQL Server** | Relaciona baza podataka |
| **JWT** | JSON Web Tokens za auth |
| **bcryptjs** | Hashovanje lozinki |
| **cookie-parser** | Parsiranje cookies |

---

## Arhitektura

```
taskify/
├── client/                     # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services, guards, models, interceptors
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── pages/          # Route components (10 stranica)
│   │   │   └── shared/         # Reusable components (Button, Input, Modal)
│   │   └── styles.css          # Global styles + Tailwind
│   └── package.json
│
├── server/                     # Node.js backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (6 modela)
│   │   ├── migrations/         # 4 SQL migracije
│   │   └── seed.js             # Test data seeder
│   ├── src/
│   │   ├── config/             # Environment config
│   │   ├── controllers/        # Route handlers (6 kontrolera)
│   │   ├── middleware/          # Auth, role checking
│   │   ├── routes/             # API routes (6 fajlova)
│   │   └── server.js           # Entry point
│   └── package.json
│
└── README.md
```

---

## Database Schema

### Entiteti (6 modela)

```
User
├── id, name, email, password, bio, phone
├── role (USER | ADMIN)
├── createdAt, updatedAt
└── Relacije: ownedProjects, projectMembers, createdTasks

Project
├── id, name, description, color, isArchived
├── ownerId → User
├── createdAt, updatedAt
└── Relacije: owner, members, boards

ProjectMember (join tabela)
├── id, projectId → Project, userId → User
├── role (OWNER | MANAGER | MEMBER)
└── joinedAt

Board
├── id, name, projectId → Project
├── createdAt, updatedAt
└── Relacije: project, columns

Column
├── id, name, boardId → Board
├── position, color
├── createdAt, updatedAt
└── Relacije: board, tasks

Task
├── id, title, description
├── columnId → Column, createdById → User
├── position, priority (LOW | MEDIUM | HIGH | URGENT)
├── dueDate, completedAt
├── createdAt, updatedAt
└── Relacije: column, createdBy
```

---

## Migracije

Projekat sadrži 4 SQL Server migracije sa 8 različitih tipova operacija:

| # | Migracija | Operacije |
|---|-----------|-----------|
| 1 | `init_taskify` | CREATE TABLE (6), CREATE INDEX (10), ADD FOREIGN KEY (7) |
| 2 | `add_user_profile_fields` | ADD COLUMN (bio, phone) |
| 3 | `alter_task_constraints` | ALTER COLUMN (title 255→512), ADD CHECK CONSTRAINT (priority) |
| 4 | `drop_unused_columns` | DROP COLUMN (avatarUrl, wipLimit), DROP INDEX (dueDate) |

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/register` | Registracija novog korisnika |
| POST | `/login` | Prijava korisnika |
| POST | `/logout` | Odjava korisnika |
| GET | `/me` | Trenutno ulogovani korisnik |

### Users (`/api/users`) — samo ADMIN

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/` | Lista svih korisnika |
| GET | `/:id` | Detalji korisnika |
| PATCH | `/:id/role` | Promeni ulogu korisnika |

### Projects (`/api/projects`)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/` | Lista projekata korisnika |
| POST | `/` | Kreiraj novi projekat |
| GET | `/:id` | Detalji projekta |
| PUT | `/:id` | Ažuriraj projekat |
| DELETE | `/:id` | Obriši projekat |
| POST | `/:id/members` | Dodaj člana |
| DELETE | `/:id/members/:userId` | Ukloni člana |
| PATCH | `/:id/members/:userId/role` | Promeni rolu člana |

### Boards (`/api/projects/:projectId/boards`)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/` | Lista board-ova projekta |
| POST | `/` | Kreiraj board |
| GET | `/:id` | Board sa kolonama i taskovima |
| PUT | `/:id` | Ažuriraj board |
| DELETE | `/:id` | Obriši board |

### Columns (`/api/boards/:boardId/columns`)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/` | Lista kolona |
| POST | `/` | Kreiraj kolonu |
| PUT | `/:id` | Ažuriraj kolonu |
| DELETE | `/:id` | Obriši kolonu |
| PATCH | `/reorder` | Promeni redosled kolona |

### Tasks (`/api/tasks`)

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/` | Lista taskova (sa filterima) |
| POST | `/` | Kreiraj task |
| GET | `/:id` | Detalji taska |
| PUT | `/:id` | Ažuriraj task |
| DELETE | `/:id` | Obriši task |
| PATCH | `/:id/move` | Premesti task (Kanban D&D) |

---

## Instalacija

### Preduslovi

- **Node.js 20+** (Angular 21 zahteva minimum v20.19)
- **SQL Server** (lokalna instanca ili Azure SQL)
- **npm**

### 1. Kloniraj repozitorijum

```bash
git clone <repository-url>
cd taskify
```

### 2. Backend Setup

```bash
cd server
npm install
```

Kreiraj `.env` fajl:

```env
# Server
PORT=8081
NODE_ENV=development

# Database (SQL Server)
DATABASE_URL="sqlserver://localhost:1433;database=taskify;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cookies
COOKIE_NAME=taskify_token

# CORS
CORS_ORIGIN=http://localhost:4200
```

Pokreni migracije i seed:

```bash
npx prisma migrate dev
node prisma/seed.js
```

Pokreni server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Pokreni Angular:

```bash
npm start
```

---

## Pokretanje

| Servis | URL | Komanda |
|--------|-----|---------|
| Backend | http://localhost:8081 | `cd server && npm run dev` |
| Frontend | http://localhost:4200 | `cd client && npm start` |

---

## Test Kredencijali

Nakon pokretanja `seed.js`, dostupni su sledeći test nalozi:

| Korisnik | Email | Lozinka | Uloga |
|----------|-------|---------|-------|
| Admin | `admin@taskify.test` | `admin123` | ADMIN |
| Marko Petrović | `marko@taskify.test` | `password` | USER (Project Owner) |
| Ana Jovanović | `ana@taskify.test` | `password` | USER (Manager) |
| Stefan Nikolić | `stefan@taskify.test` | `password` | USER (Member) |
| Jovana Đorđević | `jovana@taskify.test` | `password` | USER (Member) |

**Preporučeni test scenario:**
1. Prijavi se kao `marko@taskify.test`
2. Otvori projekat "Taskify Development"
3. Otvori board "Sprint 1"
4. Testiraj drag & drop taskova između kolona

---

## NPM Skripte

### Backend (`/server`)

| Komanda | Opis |
|---------|------|
| `npm run dev` | Pokreće server u development modu (nodemon) |
| `npm start` | Pokreće server u production modu |
| `npx prisma migrate dev` | Kreira novu migraciju |
| `npx prisma generate` | Generiše Prisma klijenta |
| `node prisma/seed.js` | Popunjava bazu test podacima |

### Frontend (`/client`)

| Komanda | Opis |
|---------|------|
| `npm start` | Pokreće Angular dev server |
| `npm run build` | Build za produkciju |
| `npm run watch` | Build sa watch modom |

---

## Struktura Projekta

### Frontend - Ključni Fajlovi

```
client/src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts          # Zaštita ruta za ulogovane
│   │   ├── admin.guard.ts         # Zaštita admin ruta
│   │   └── guest.guard.ts         # Zaštita za neulogovane (login/register)
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Dodaje credentials na requests
│   ├── models/
│   │   ├── user.model.ts          # User tipovi
│   │   ├── project.model.ts       # Project tipovi
│   │   ├── board.model.ts         # Board, Column tipovi
│   │   └── task.model.ts          # Task tipovi
│   └── services/
│       ├── api.service.ts         # HTTP wrapper
│       ├── auth.service.ts        # Autentifikacija
│       ├── projects.service.ts    # CRUD projekata
│       ├── boards.service.ts      # CRUD board-ova
│       ├── tasks.service.ts       # CRUD taskova
│       └── users.service.ts       # Admin user management
├── layout/
│   ├── navbar/                    # Navigacija sa user menijem
│   └── footer/                    # Footer
├── pages/
│   ├── home/                      # Landing stranica
│   ├── login/                     # Login forma
│   ├── register/                  # Registracija
│   ├── projects/                  # Lista projekata
│   ├── project-details/           # Detalji projekta sa boards
│   ├── board/                     # KANBAN BOARD (glavna stranica)
│   ├── account/                   # Profil korisnika
│   ├── not-found/                 # 404 stranica
│   └── admin/
│       ├── dashboard/             # Admin dashboard
│       └── users-tab/             # Upravljanje korisnicima
└── shared/
    └── components/
        ├── button/                # Reusable button (7 korišćenja)
        ├── input/                 # Reusable input (5 korišćenja)
        └── modal/                 # Reusable modal (3 korišćenja)
```

### Backend - Ključni Fajlovi

```
server/src/
├── config/
│   └── env.js                     # Environment varijable
├── controllers/
│   ├── auth.controller.js         # Login, register, logout, me
│   ├── user.controller.js         # Admin user management
│   ├── project.controller.js      # CRUD projekata + članovi
│   ├── board.controller.js        # CRUD board-ova
│   ├── column.controller.js       # CRUD kolona + reorder
│   └── task.controller.js         # CRUD taskova + move
├── middleware/
│   ├── auth.js                    # JWT verifikacija (requireAuth)
│   └── roles.js                   # Role provera (requireRole)
├── routes/
│   ├── auth.routes.js             # POST register/login/logout, GET me
│   ├── user.routes.js             # GET users, PATCH role (ADMIN only)
│   ├── project.routes.js         # CRUD + members
│   ├── board.routes.js            # CRUD
│   ├── column.routes.js           # CRUD + reorder
│   └── task.routes.js             # CRUD + move
└── server.js                      # Express app entry point
```

---

## Role i Permisije

### Sistemske uloge

| Rola | Opis |
|------|------|
| **ADMIN** | Pristup admin panelu, upravljanje korisnicima |
| **USER** | Obični korisnik, radi sa projektima |

### Projektne uloge

| Rola | Projekat | Board | Taskovi | Članovi |
|------|----------|-------|---------|---------|
| **OWNER** | CRUD | CRUD | CRUD | Dodaj/Ukloni/Promeni role |
| **MANAGER** | Read | CRUD | CRUD | - |
| **MEMBER** | Read | Read | CRUD | - |

---

## Licenca

MIT License
