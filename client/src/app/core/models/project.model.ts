// ============================================================================
// TASKIFY - Project Models
// ============================================================================

import { User, ProjectMember } from './user.model';
import { Board } from './board.model';

export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  isArchived: boolean;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: ProjectMember[];
  boards?: Board[];
  _count?: {
    boards: number;
  };
}

export interface ProjectFilters {
  q?: string;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
  isArchived?: boolean;
}

export interface AddMemberDto {
  email: string;
  role?: 'MANAGER' | 'MEMBER';
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
