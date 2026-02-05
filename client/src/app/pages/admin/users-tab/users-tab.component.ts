// ============================================================================
// TASKIFY - Users Tab Component (Admin)
// ============================================================================

import { Component, inject, OnInit, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherSearch, featherRefreshCw } from '@ng-icons/feather-icons';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [DatePipe, FormsModule, NgIconComponent, ButtonComponent],
  viewProviders: [provideIcons({ featherSearch, featherRefreshCw })],
  template: `
    <div>
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <div class="relative">
          <ng-icon name="featherSearch" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Pretraži korisnike..."
                 class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none
                        focus:ring-2 focus:ring-indigo-500" />
        </div>

        <select [(ngModel)]="roleFilter"
                class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-indigo-500">
          <option value="">Sve uloge</option>
          <option value="USER">Korisnik</option>
          <option value="ADMIN">Admin</option>
        </select>

        <app-button (click)="applyFilters()">Primeni</app-button>

        <button (click)="refresh()"
                class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <ng-icon name="featherRefreshCw" />
        </button>
      </div>

      <!-- Loading -->
      @if (users.listStatus() === 'loading') {
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      }

      <!-- Users Table -->
      @if (users.listStatus() === 'success') {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Korisnik</th>
                  <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                  <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Datum</th>
                  <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Uloga</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users.items(); track user.id) {
                  <tr class="border-t border-gray-100 hover:bg-gray-50">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center
                                    text-indigo-600 font-medium">
                          {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{{ user.name }}</p>
                          <p class="text-xs text-gray-500">ID: {{ user.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-600">{{ user.email }}</td>
                    <td class="py-3 px-4 text-sm text-gray-600">{{ user.createdAt | date:'mediumDate' }}</td>
                    <td class="py-3 px-4">
                      <select [ngModel]="user.role"
                              (ngModelChange)="updateRole(user.id, $event)"
                              [disabled]="users.mutateStatus() === 'loading'"
                              class="text-sm px-2 py-1 border border-gray-200 rounded-lg focus:outline-none
                                     focus:ring-2 focus:ring-indigo-500">
                        <option value="USER">Korisnik</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="py-8 text-center text-gray-500">Nema korisnika</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        @if (users.totalPages() > 1) {
          <div class="flex justify-center gap-2 mt-6">
            @for (page of pages(); track page) {
              <button (click)="goToPage(page)"
                      [class.bg-indigo-600]="page === users.page()"
                      [class.text-white]="page === users.page()"
                      class="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                {{ page }}
              </button>
            }
          </div>
        }
      }
    </div>
  `,
})
export class UsersTabComponent implements OnInit {
  users = inject(UsersService);

  searchQuery = '';
  roleFilter: 'USER' | 'ADMIN' | '' = '';

  pages = computed(() => {
    const total = this.users.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users.listUsers().subscribe();
  }

  applyFilters(): void {
    this.users.setQuery(this.searchQuery);
    this.users.setRoleFilter(this.roleFilter);
    this.users.listUsers({ page: 1, q: this.searchQuery, role: this.roleFilter }).subscribe();
  }

  refresh(): void {
    this.loadUsers();
  }

  goToPage(page: number): void {
    this.users.listUsers({ page }).subscribe();
  }

  updateRole(userId: number, role: 'USER' | 'ADMIN'): void {
    this.users.updateRole(userId, role).subscribe({
      next: () => this.loadUsers(),
    });
  }
}
