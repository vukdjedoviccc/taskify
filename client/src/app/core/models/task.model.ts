// ============================================================================
// TASKIFY - Task Models
// ============================================================================

import { User } from './user.model';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: number;
  title: string;
  description?: string;
  columnId: number;
  position: number;
  priority: Priority;
  dueDate?: string;
  completedAt?: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
}

// DTOs
export interface CreateTaskDto {
  title: string;
  description?: string;
  columnId: number;
  priority?: Priority;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
}

export interface MoveTaskDto {
  columnId: number;
  position: number;
}

export interface TaskFilters {
  columnId?: number;
  priority?: Priority;
  hasDueDate?: boolean;
  isOverdue?: boolean;
  q?: string;
}
