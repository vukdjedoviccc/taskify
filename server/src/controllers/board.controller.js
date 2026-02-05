// ============================================================================
// TASKIFY - Board Controller
// CRUD operacije za Kanban board-ove
// ============================================================================

import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// Default kolone za novi board
const DEFAULT_COLUMNS = [
  { name: 'To Do', position: 0, color: '#6b7280' },
  { name: 'In Progress', position: 1, color: '#3b82f6' },
  { name: 'Done', position: 2, color: '#22c55e' },
];

// ============================================================================
// LIST BOARDS (za projekat)
// ============================================================================
export async function listBoards(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const userId = req.user.id;

    // Proveri pristup projektu
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const boards = await prisma.board.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { columns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(boards);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// GET BOARD BY ID (sa kolonama i taskovima)
// ============================================================================
export async function getBoard(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: true,
          },
        },
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                createdBy: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Proveri pristup
    const isMember = board.project.members.some((m) => m.userId === userId);
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(board);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// CREATE BOARD
// ============================================================================
export async function createBoard(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const userId = req.user.id;
    const { name, createDefaultColumns = true } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Board name is required' });
    }

    // Proveri pristup (OWNER ili MANAGER)
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (membership && !['OWNER', 'MANAGER'].includes(membership.role) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner or manager can create boards' });
    }

    // Kreiraj board sa default kolonama
    const board = await prisma.board.create({
      data: {
        name,
        projectId,
        ...(createDefaultColumns
          ? {
              columns: {
                create: DEFAULT_COLUMNS,
              },
            }
          : {}),
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return res.status(201).json(board);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// UPDATE BOARD
// ============================================================================
export async function updateBoard(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const { name } = req.body;

    // Dohvati board sa projektom
    const board = await prisma.board.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Proveri pristup
    const membership = board.project.members.find((m) => m.userId === userId);
    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (membership && !['OWNER', 'MANAGER'].includes(membership.role) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner or manager can update boards' });
    }

    const updated = await prisma.board.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// DELETE BOARD
// ============================================================================
export async function deleteBoard(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    // Dohvati board sa projektom
    const board = await prisma.board.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Proveri pristup
    const membership = board.project.members.find((m) => m.userId === userId);
    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (membership && membership.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner can delete boards' });
    }

    await prisma.board.delete({ where: { id } });

    return res.json({ message: 'Board deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
