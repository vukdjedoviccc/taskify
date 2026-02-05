// ============================================================================
// TASKIFY - Swagger/OpenAPI Configuration
// Automatska API dokumentacija
// ============================================================================

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Taskify API',
      version: '1.0.0',
      description:
        'REST API za Taskify – aplikaciju za upravljanje projektima i taskovima sa Kanban board funkcionalnošću.',
    },
    servers: [
      {
        url: 'http://localhost:8081',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'taskify_token',
          description: 'JWT token u HTTP-only cookie-ju',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token u Authorization header-u',
        },
      },
      schemas: {
        // ====================================================================
        // User
        // ====================================================================
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Marko Petrović' },
            email: { type: 'string', format: 'email', example: 'marko@taskify.test' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
            bio: { type: 'string', nullable: true, example: 'Full-stack developer' },
            phone: { type: 'string', nullable: true, example: '+381641234567' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ====================================================================
        // Project
        // ====================================================================
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Taskify Development' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', example: '#6366f1' },
            isArchived: { type: 'boolean', example: false },
            ownerId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ====================================================================
        // ProjectMember
        // ====================================================================
        ProjectMember: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            projectId: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 2 },
            role: { type: 'string', enum: ['OWNER', 'MANAGER', 'MEMBER'], example: 'MEMBER' },
            joinedAt: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/User' },
          },
        },

        // ====================================================================
        // Board
        // ====================================================================
        Board: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Sprint 1' },
            projectId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ====================================================================
        // Column
        // ====================================================================
        Column: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'To Do' },
            boardId: { type: 'integer', example: 1 },
            position: { type: 'integer', example: 0 },
            color: { type: 'string', example: '#6b7280' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ====================================================================
        // Task
        // ====================================================================
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Implementirati login' },
            description: { type: 'string', nullable: true },
            columnId: { type: 'integer', example: 1 },
            position: { type: 'integer', example: 0 },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'MEDIUM' },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            createdById: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ====================================================================
        // Reusable response schemas
        // ====================================================================
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error description' },
          },
        },

        PaginatedResponse: {
          type: 'object',
          properties: {
            items: { type: 'array', items: {} },
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 12 },
            total: { type: 'integer', example: 45 },
            totalPages: { type: 'integer', example: 4 },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autentifikacija (registracija, prijava, odjava)' },
      { name: 'Users', description: 'Upravljanje korisnicima (admin)' },
      { name: 'Projects', description: 'CRUD operacije za projekte i članove' },
      { name: 'Boards', description: 'Kanban table unutar projekata' },
      { name: 'Columns', description: 'Kolone na Kanban tabli' },
      { name: 'Tasks', description: 'Taskovi / kartice na Kanban tabli' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
