// ============================================================================
// TASKIFY - Main Server
// Task Management API sa Kanban Board funkcionalnostima
// ============================================================================

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';

// Rute
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import boardRoutes from './routes/board.routes.js';
import columnRoutes from './routes/column.routes.js';
import taskRoutes from './routes/task.routes.js';

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// ============================================================================
// SWAGGER API DOCS
// ============================================================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, app: 'Taskify' }));

// Auth
app.use('/api/auth', authRoutes);

// Users (admin)
app.use('/api/users', userRoutes);

// Projects
app.use('/api/projects', projectRoutes);

// Boards i Columns (nested routes)
app.use('/api', boardRoutes);
app.use('/api', columnRoutes);

// Tasks
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// ============================================================================
// START SERVER
// ============================================================================

const PORT = env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Taskify API running on http://localhost:${PORT}`);
});
