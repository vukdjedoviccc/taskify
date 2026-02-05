import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import {
  listUsers,
  getUserById,
  updateUserRole,
} from '../controllers/user.controller.js';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Lista svih korisnika (admin)
 *     description: Vraća paginiranu listu korisnika sa opcionalnim filterima. Samo za ADMIN korisnike.
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
 *         description: Pretraga po imenu ili email-u
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *         description: Filter po ulozi
 *     responses:
 *       200:
 *         description: Paginirana lista korisnika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 *       403:
 *         description: Nije ADMIN
 */
router.get('/', requireAuth, requireRole('ADMIN'), listUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Detalji korisnika (admin)
 *     description: Vraća detaljne informacije o korisniku uključujući statistiku. Samo za ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID korisnika
 *     responses:
 *       200:
 *         description: Detalji korisnika
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     _count:
 *                       type: object
 *                       properties:
 *                         createdTasks:
 *                           type: integer
 *                         projectMembers:
 *                           type: integer
 *       404:
 *         description: Korisnik nije pronađen
 *       401:
 *         description: Nije autentifikovan
 *       403:
 *         description: Nije ADMIN
 */
router.get('/:id', requireAuth, requireRole('ADMIN'), getUserById);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Promena uloge korisnika (admin)
 *     description: Menja sistemsku ulogu korisnika (USER/ADMIN). Samo za ADMIN.
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Uloga uspešno promenjena
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Nevažeća uloga
 *       404:
 *         description: Korisnik nije pronađen
 *       401:
 *         description: Nije autentifikovan
 *       403:
 *         description: Nije ADMIN
 */
router.patch('/:id/role', requireAuth, requireRole('ADMIN'), updateUserRole);

export default router;
