// ============================================================================
// TASKIFY - Project Controller
// CRUD operacije za projekte i članstvo
// ============================================================================

import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// ============================================================================
// LIST PROJECTS (za trenutnog korisnika)
// ============================================================================
export async function listProjects(req, res) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 12));
    const q = req.query.q || '';
    const includeArchived = req.query.includeArchived === 'true';

    const where = {
      members: {
        some: { userId },
      },
      ...(q ? { name: { contains: q } } : {}),
      ...(!includeArchived ? { isArchived: false } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          _count: {
            select: { boards: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    return res.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// GET PROJECT BY ID
// ============================================================================
export async function getProject(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        boards: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Proveri da li je korisnik član projekta
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// CREATE PROJECT
// ============================================================================
export async function createProject(req, res) {
  try {
    const { name, description, color } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Kreiraj projekat i dodaj kreatora kao OWNER-a
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        color: color || '#6366f1',
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return res.status(201).json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// UPDATE PROJECT
// ============================================================================
export async function updateProject(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const { name, description, color, isArchived } = req.body;

    // Proveri da li korisnik ima pristup (OWNER ili ADMIN)
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });

    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (membership && membership.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner can update project' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(color !== undefined ? { color } : {}),
        ...(isArchived !== undefined ? { isArchived } : {}),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return res.json(project);
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// DELETE PROJECT
// ============================================================================
export async function deleteProject(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    // Proveri da li korisnik ima pristup (OWNER ili ADMIN)
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });

    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (membership && membership.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    await prisma.project.delete({ where: { id } });

    return res.json({ message: 'Project deleted' });
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ message: 'Project not found' });
    }
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// ADD MEMBER TO PROJECT
// ============================================================================
export async function addMember(req, res) {
  try {
    const projectId = Number(req.params.id);
    const userId = req.user.id;
    const { email, role = 'MEMBER' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Proveri da li korisnik ima pristup (OWNER ili MANAGER)
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (membership && !['OWNER', 'MANAGER'].includes(membership.role) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner or manager can add members' });
    }

    // Pronađi korisnika po emailu
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Proveri da li je već član
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });

    if (existingMember) {
      return res.status(409).json({ message: 'User is already a member' });
    }

    // Samo OWNER može dodati MANAGER ili OWNER
    if (['OWNER', 'MANAGER'].includes(role) && membership?.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner can add managers' });
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role: ['OWNER', 'MANAGER', 'MEMBER'].includes(role) ? role : 'MEMBER',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json(newMember);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// REMOVE MEMBER FROM PROJECT
// ============================================================================
export async function removeMember(req, res) {
  try {
    const projectId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);
    const userId = req.user.id;

    // Proveri da li korisnik ima pristup (OWNER ili ADMIN)
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (membership && membership.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    // Ne dozvoli uklanjanje OWNER-a
    const memberToRemove = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberUserId } },
    });

    if (!memberToRemove) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (memberToRemove.role === 'OWNER') {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberUserId } },
    });

    return res.json({ message: 'Member removed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// ============================================================================
// UPDATE MEMBER ROLE
// ============================================================================
export async function updateMemberRole(req, res) {
  try {
    const projectId = Number(req.params.id);
    const memberUserId = Number(req.params.userId);
    const userId = req.user.id;
    const { role } = req.body;

    if (!role || !['MANAGER', 'MEMBER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Samo OWNER može menjati role
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (membership && membership.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only owner can change roles' });
    }

    // Ne dozvoli promenu OWNER role
    const memberToUpdate = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberUserId } },
    });

    if (!memberToUpdate) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (memberToUpdate.role === 'OWNER') {
      return res.status(400).json({ message: 'Cannot change owner role' });
    }

    const updated = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId: memberUserId } },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
