// ============================================================================
// TASKIFY - Application Routes
// ============================================================================

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },

  // Auth routes (guest only)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },

  // Protected routes (authenticated users)
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
  },
  {
    path: 'projects/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/project-details/project-details.component').then((m) => m.ProjectDetailsComponent),
  },
  {
    path: 'boards/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/board/board.component').then((m) => m.BoardComponent),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account.component').then((m) => m.AccountComponent),
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/users-tab/users-tab.component').then((m) => m.UsersTabComponent),
      },
    ],
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
