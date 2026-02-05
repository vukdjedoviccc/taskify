// ============================================================================
// TASKIFY - Navbar Component
// ============================================================================

import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  featherMenu,
  featherX,
  featherUser,
  featherLogOut,
  featherFolder,
  featherHome,
  featherSettings,
} from '@ng-icons/feather-icons';
import { AuthService } from '../../core/services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIconComponent],
  viewProviders: [
    provideIcons({
      featherMenu,
      featherX,
      featherUser,
      featherLogOut,
      featherFolder,
      featherHome,
      featherSettings,
    }),
  ],
  template: `
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">T</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Taskify</span>
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-6">
            @if (auth.isAuthenticated()) {
              <a routerLink="/projects"
                 routerLinkActive="text-indigo-600"
                 [routerLinkActiveOptions]="{exact: false}"
                 class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ng-icon name="featherFolder" class="text-lg" />
                <span>Projekti</span>
              </a>

              <!-- User Menu -->
              <div class="relative">
                <button (click)="toggleUserMenu()"
                        class="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span class="text-indigo-600 font-medium">
                      {{ auth.user()?.name?.charAt(0)?.toUpperCase() }}
                    </span>
                  </div>
                </button>

                @if (showUserMenu()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div class="p-3 border-b border-gray-100">
                      <p class="font-medium text-gray-900">{{ auth.user()?.name }}</p>
                      <p class="text-sm text-gray-500">{{ auth.user()?.email }}</p>
                    </div>
                    <a routerLink="/account"
                       (click)="showUserMenu.set(false)"
                       class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50">
                      <ng-icon name="featherUser" class="text-lg" />
                      <span>Profil</span>
                    </a>
                    @if (auth.isAdmin()) {
                      <a routerLink="/admin"
                         (click)="showUserMenu.set(false)"
                         class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50">
                        <ng-icon name="featherSettings" class="text-lg" />
                        <span>Admin</span>
                      </a>
                    }
                    <button (click)="logout()"
                            class="flex items-center gap-2 px-3 py-2 w-full text-left text-red-600 hover:bg-red-50">
                      <ng-icon name="featherLogOut" class="text-lg" />
                      <span>Odjavi se</span>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/login"
                 class="text-gray-600 hover:text-gray-900 transition-colors">
                Prijava
              </a>
              <a routerLink="/register"
                 class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Registracija
              </a>
            }
          </div>

          <!-- Mobile menu button -->
          <button (click)="toggleMobileMenu()" class="md:hidden p-2">
            <ng-icon [name]="showMobileMenu() ? 'featherX' : 'featherMenu'" class="text-2xl" />
          </button>
        </div>

        <!-- Mobile Navigation -->
        @if (showMobileMenu()) {
          <div class="md:hidden py-4 border-t border-gray-200">
            @if (auth.isAuthenticated()) {
              <a routerLink="/projects"
                 (click)="showMobileMenu.set(false)"
                 class="block py-2 text-gray-600 hover:text-gray-900">
                Projekti
              </a>
              <a routerLink="/account"
                 (click)="showMobileMenu.set(false)"
                 class="block py-2 text-gray-600 hover:text-gray-900">
                Profil
              </a>
              <button (click)="logout()"
                      class="block py-2 text-red-600 hover:text-red-800 w-full text-left">
                Odjavi se
              </button>
            } @else {
              <a routerLink="/login"
                 (click)="showMobileMenu.set(false)"
                 class="block py-2 text-gray-600 hover:text-gray-900">
                Prijava
              </a>
              <a routerLink="/register"
                 (click)="showMobileMenu.set(false)"
                 class="block py-2 text-indigo-600 hover:text-indigo-800">
                Registracija
              </a>
            }
          </div>
        }
      </nav>
    </header>
  `,
})
export class NavbarComponent {
  auth = inject(AuthService);

  showUserMenu = signal(false);
  showMobileMenu = signal(false);

  toggleUserMenu() {
    this.showUserMenu.update((v) => !v);
  }

  toggleMobileMenu() {
    this.showMobileMenu.update((v) => !v);
  }

  logout() {
    this.showUserMenu.set(false);
    this.showMobileMenu.set(false);
    this.auth.logout().subscribe();
  }
}
