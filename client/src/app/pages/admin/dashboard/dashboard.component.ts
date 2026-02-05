// ============================================================================
// TASKIFY - Admin Dashboard Component
// ============================================================================

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherUsers, featherSettings } from '@ng-icons/feather-icons';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIconComponent],
  viewProviders: [provideIcons({ featherUsers, featherSettings })],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-8">
        <nav class="flex gap-8">
          @for (tab of tabs; track tab.path) {
            <a [routerLink]="tab.path"
               routerLinkActive="border-indigo-600 text-indigo-600"
               [routerLinkActiveOptions]="{ exact: true }"
               class="flex items-center gap-2 py-4 px-1 border-b-2 border-transparent
                      text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors">
              <ng-icon [name]="tab.icon" />
              {{ tab.label }}
            </a>
          }
        </nav>
      </div>

      <!-- Content -->
      <router-outlet />
    </div>
  `,
})
export class DashboardComponent {
  tabs = [
    { path: 'users', label: 'Korisnici', icon: 'featherUsers' },
  ];
}
