// ============================================================================
// TASKIFY - Project Routes
// Rute za projekte i članstvo
// ============================================================================

import { Router } from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Sve rute zahtevaju autentifikaciju
router.use(requireAuth);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Lista projekata
 *     description: Vraća paginiranu listu projekata u kojima je korisnik član. ADMIN vidi sve.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Broj stranice
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 12
 *           maximum: 50
 *         description: Broj stavki po stranici
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Pretraga po nazivu projekta
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Uključi arhivirane projekte
 *     responses:
 *       200:
 *         description: Paginirana lista projekata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/', listProjects);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Kreiranje projekta
 *     description: Kreira novi projekat. Korisnik automatski postaje OWNER.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Novi Projekat
 *               description:
 *                 type: string
 *                 example: Opis projekta
 *               color:
 *                 type: string
 *                 example: "#6366f1"
 *                 default: "#6366f1"
 *     responses:
 *       201:
 *         description: Projekat uspešno kreiran
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Nedostaje naziv projekta
 *       401:
 *         description: Nije autentifikovan
 */
router.post('/', createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Detalji projekta
 *     description: Vraća detalje projekta sa vlasnicima, članovima i board-ovima.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
 *     responses:
 *       200:
 *         description: Detalji projekta
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Project'
 *                 - type: object
 *                   properties:
 *                     owner:
 *                       $ref: '#/components/schemas/User'
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectMember'
 *                     boards:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Board'
 *       403:
 *         description: Nema pristup projektu
 *       404:
 *         description: Projekat nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.get('/:id', getProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: Ažuriranje projekta
 *     description: Ažurira podatke projekta. Samo OWNER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               isArchived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Projekat uspešno ažuriran
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       403:
 *         description: Nema privilegiju za izmenu
 *       404:
 *         description: Projekat nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.put('/:id', updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Brisanje projekta
 *     description: Briše projekat i sve povezane podatke (kaskadno). Samo OWNER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
 *     responses:
 *       200:
 *         description: Projekat uspešno obrisan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project deleted
 *       403:
 *         description: Nema privilegiju za brisanje
 *       404:
 *         description: Projekat nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.delete('/:id', deleteProject);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     tags: [Projects]
 *     summary: Dodavanje člana u projekat
 *     description: Dodaje korisnika u projekat po email-u. Samo OWNER/MANAGER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ana@taskify.test
 *               role:
 *                 type: string
 *                 enum: [OWNER, MANAGER, MEMBER]
 *                 default: MEMBER
 *     responses:
 *       201:
 *         description: Član uspešno dodat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectMember'
 *       400:
 *         description: Nedostaje email
 *       404:
 *         description: Korisnik ili projekat nije pronađen
 *       409:
 *         description: Korisnik je već član projekta
 *       403:
 *         description: Nema privilegiju
 *       401:
 *         description: Nije autentifikovan
 */
router.post('/:id/members', addMember);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Uklanjanje člana iz projekta
 *     description: Uklanja korisnika iz projekta. Samo OWNER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID korisnika za uklanjanje
 *     responses:
 *       200:
 *         description: Član uspešno uklonjen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Member removed
 *       400:
 *         description: Ne može ukloniti vlasnika projekta
 *       403:
 *         description: Nema privilegiju
 *       404:
 *         description: Član nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.delete('/:id/members/:userId', removeMember);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}/role:
 *   patch:
 *     tags: [Projects]
 *     summary: Promena uloge člana u projektu
 *     description: Menja ulogu člana projekta (MANAGER ili MEMBER). Samo OWNER ili ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID projekta
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID korisnika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [MANAGER, MEMBER]
 *     responses:
 *       200:
 *         description: Uloga uspešno promenjena
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectMember'
 *       400:
 *         description: Nevažeća uloga
 *       403:
 *         description: Nema privilegiju
 *       404:
 *         description: Član nije pronađen
 *       401:
 *         description: Nije autentifikovan
 */
router.patch('/:id/members/:userId/role', updateMemberRole);

export default router;
