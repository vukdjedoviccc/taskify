// ============================================================================
// TASKIFY - Main Server
// Task Management API sa Kanban Board funkcionalnostima
// ============================================================================

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';

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
// ROUTES
// ============================================================================

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, app: 'Taskify' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// ============================================================================
// START SERVER
// ============================================================================

const PORT = env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Taskify API running on http://localhost:${PORT}`);
});
