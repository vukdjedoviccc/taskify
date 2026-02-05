// ============================================================================
// TASKIFY - Account Page Component
// ============================================================================

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherUser, featherMail, featherCalendar, featherShield, featherLogOut } from '@ng-icons/feather-icons';
import { AuthService } from '../../core/services';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, DatePipe, NgIconComponent, ButtonComponent],
  viewProviders: [provideIcons({ featherUser, featherMail, featherCalendar, featherShield, featherLogOut })],
  template: `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Moj profil</h1>

      @if (auth.user(); as user) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center
                          justify-center text-white text-3xl font-bold">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="text-white">
                <h2 class="text-2xl font-bold">{{ user.name }}</h2>
                <p class="text-indigo-100">{{ user.email }}</p>
              </div>
            </div>
          </div>

          <!-- Details -->
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <ng-icon name="featherUser" class="text-xl text-gray-400" />
              <div>
                <p class="text-sm text-gray-500">Ime</p>
                <p class="font-medium text-gray-900">{{ user.name }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <ng-icon name="featherMail" class="text-xl text-gray-400" />
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-medium text-gray-900">{{ user.email }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <ng-icon name="featherShield" class="text-xl text-gray-400" />
              <div>
                <p class="text-sm text-gray-500">Uloga</p>
                <p class="font-medium text-gray-900">
                  {{ user.role === 'ADMIN' ? 'Administrator' : 'Korisnik' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <ng-icon name="featherCalendar" class="text-xl text-gray-400" />
              <div>
                <p class="text-sm text-gray-500">Član od</p>
                <p class="font-medium text-gray-900">{{ user.createdAt | date:'longDate' }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 pb-6">
            <app-button variant="danger" [fullWidth]="true" (click)="logout()">
              <ng-icon name="featherLogOut" />
              Odjavi se
            </app-button>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="mt-6 grid grid-cols-2 gap-4">
          <a routerLink="/projects"
             class="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md
                    transition-shadow text-center">
            <p class="font-medium text-gray-900">Moji projekti</p>
            <p class="text-sm text-gray-500">Pogledaj sve projekte</p>
          </a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin"
               class="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md
                      transition-shadow text-center">
              <p class="font-medium text-gray-900">Admin panel</p>
              <p class="text-sm text-gray-500">Upravljaj aplikacijom</p>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class AccountComponent {
  auth = inject(AuthService);

  logout(): void {
    this.auth.logout().subscribe();
  }
}
