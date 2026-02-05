// ============================================================================
// TASKIFY - User Models
// ============================================================================

export type UserRole = 'USER' | 'ADMIN';
export type ProjectRole = 'OWNER' | 'MANAGER' | 'MEMBER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: ProjectRole;
  joinedAt: string;
  user: User;
}
