// ============================================================================
// TASKIFY - Database Seed
// Popunjava bazu test podacima za development
// ============================================================================

import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// ============================================================================
// SEED USERS
// ============================================================================
async function seedUsers() {
  console.log('Seeding users...');

  const users = [
    {
      name: 'Admin User',
      email: 'admin@taskify.test',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
    },
    {
      name: 'Marko Petrović',
      email: 'marko@taskify.test',
      password: await hashPassword('password'),
      role: 'USER',
    },
    {
      name: 'Ana Jovanović',
      email: 'ana@taskify.test',
      password: await hashPassword('password'),
      role: 'USER',
    },
    {
      name: 'Stefan Nikolić',
      email: 'stefan@taskify.test',
      password: await hashPassword('password'),
      role: 'USER',
    },
    {
      name: 'Jovana Đorđević',
      email: 'jovana@taskify.test',
      password: await hashPassword('password'),
      role: 'USER',
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    createdUsers.push(created);
    console.log(`  ✓ User: ${created.email}`);
  }

  return createdUsers;
}

// ============================================================================
// SEED PROJECT WITH MEMBERS
// ============================================================================
async function seedProject(users) {
  console.log('Seeding project...');

  const [admin, marko, ana, stefan, jovana] = users;

  // Kreiraj projekat
  const project = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Taskify Development',
      description: 'Razvoj Taskify aplikacije - Task Management sistem sa Kanban board-om',
      color: '#6366f1',
      ownerId: marko.id,
    },
  });
  console.log(`  ✓ Project: ${project.name}`);

  // Dodaj članove projekta
  const members = [
    { projectId: project.id, userId: marko.id, role: 'OWNER' },
    { projectId: project.id, userId: ana.id, role: 'MANAGER' },
    { projectId: project.id, userId: stefan.id, role: 'MEMBER' },
    { projectId: project.id, userId: jovana.id, role: 'MEMBER' },
  ];

  for (const member of members) {
    await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: member.projectId,
          userId: member.userId,
        },
      },
      update: { role: member.role },
      create: member,
    });
  }
  console.log(`  ✓ Added ${members.length} project members`);

  return project;
}

// ============================================================================
// SEED BOARD WITH COLUMNS
// ============================================================================
async function seedBoard(projectId) {
  console.log('Seeding board and columns...');

  // Kreiraj board
  const board = await prisma.board.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Sprint 1',
      projectId,
    },
  });
  console.log(`  ✓ Board: ${board.name}`);

  // Kreiraj default kolone
  const columns = [
    { name: 'To Do', boardId: board.id, position: 0, color: '#6b7280' },
    { name: 'In Progress', boardId: board.id, position: 1, color: '#3b82f6' },
    { name: 'Done', boardId: board.id, position: 2, color: '#22c55e' },
  ];

  const createdColumns = [];
  for (const column of columns) {
    const existing = await prisma.column.findFirst({
      where: { boardId: column.boardId, name: column.name },
    });

    if (existing) {
      createdColumns.push(existing);
    } else {
      const created = await prisma.column.create({ data: column });
      createdColumns.push(created);
    }
  }
  console.log(`  ✓ Created ${createdColumns.length} columns`);

  return { board, columns: createdColumns };
}

// ============================================================================
// SEED TASKS
// ============================================================================
async function seedTasks(columns, users) {
  console.log('Seeding tasks...');

  const [todoColumn, inProgressColumn, doneColumn] = columns;
  const [admin, marko, ana, stefan, jovana] = users;

  // Prepare due dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tasks = [
    // To Do tasks
    {
      title: 'Implementirati Kanban Drag & Drop',
      description: 'Koristiti Angular CDK Drag & Drop za implementaciju premještanja taskova između kolona.',
      columnId: todoColumn.id,
      position: 0,
      priority: 'HIGH',
      dueDate: nextWeek,
      createdById: marko.id,
    },
    {
      title: 'Dodati filtriranje taskova',
      description: 'Implementirati filtriranje taskova po prioritetu, roku i kreatoru.',
      columnId: todoColumn.id,
      position: 1,
      priority: 'MEDIUM',
      dueDate: nextWeek,
      createdById: ana.id,
    },
    {
      title: 'Kreirati kalendar komponentu',
      description: 'Implementirati mesečni/nedeljni prikaz taskova po due date-u.',
      columnId: todoColumn.id,
      position: 2,
      priority: 'LOW',
      createdById: marko.id,
    },

    // In Progress tasks
    {
      title: 'API za upravljanje taskovima',
      description: 'CRUD operacije za taskove: kreiranje, čitanje, ažuriranje, brisanje. Uključiti move endpoint za Kanban.',
      columnId: inProgressColumn.id,
      position: 0,
      priority: 'HIGH',
      dueDate: tomorrow,
      createdById: marko.id,
    },
    {
      title: 'Dizajn Kanban board UI',
      description: 'Kreirati responzivan dizajn za Kanban board sa Tailwind CSS.',
      columnId: inProgressColumn.id,
      position: 1,
      priority: 'MEDIUM',
      createdById: ana.id,
    },

    // Done tasks
    {
      title: 'Setup Prisma + SQL Server',
      description: 'Konfigurisati Prisma ORM sa SQL Server bazom podataka.',
      columnId: doneColumn.id,
      position: 0,
      priority: 'HIGH',
      completedAt: yesterday,
      createdById: marko.id,
    },
    {
      title: 'Kreirati database shemu',
      description: 'Definisati sve modele: User, Project, Board, Column, Task.',
      columnId: doneColumn.id,
      position: 1,
      priority: 'HIGH',
      completedAt: yesterday,
      createdById: marko.id,
    },
    {
      title: 'Implementirati autentifikaciju',
      description: 'JWT autentifikacija sa HTTP-only cookies. Login, register, logout endpoints.',
      columnId: doneColumn.id,
      position: 2,
      priority: 'HIGH',
      completedAt: new Date(),
      createdById: ana.id,
    },
  ];

  const createdTasks = [];

  for (const task of tasks) {
    const created = await prisma.task.create({
      data: task,
    });
    createdTasks.push(created);
  }

  console.log(`  ✓ Created ${createdTasks.length} tasks`);
  return createdTasks;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function main() {
  console.log('\n🌱 Starting Taskify database seed...\n');

  try {
    // 1. Seed users
    const users = await seedUsers();

    // 2. Seed project with members
    const project = await seedProject(users);

    // 3. Seed board with columns
    const { board, columns } = await seedBoard(project.id);

    // 4. Seed tasks
    const tasks = await seedTasks(columns, users);

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Test credentials:');
    console.log('  Admin: admin@taskify.test / admin123');
    console.log('  User:  marko@taskify.test / password');
    console.log('');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
