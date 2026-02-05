// ============================================================================
// TASKIFY - Home Page Component
// ============================================================================

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  featherCheckSquare,
  featherUsers,
  featherCalendar,
  featherTrello,
  featherBell,
  featherZap,
} from '@ng-icons/feather-icons';
import { AuthService } from '../../core/services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIconComponent],
  viewProviders: [
    provideIcons({
      featherCheckSquare,
      featherUsers,
      featherCalendar,
      featherTrello,
      featherBell,
      featherZap,
    }),
  ],
  template: `
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Organizuj zadatke.<br />
            <span class="text-indigo-600">Postižite više zajedno.</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Taskify je moćan alat za upravljanje projektima sa Kanban tablom
            koji pomaže timovima da budu produktivniji.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            @if (auth.isAuthenticated()) {
              <a routerLink="/projects"
                 class="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white
                        px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors text-lg font-semibold">
                <ng-icon name="featherTrello" class="text-xl" />
                Moji projekti
              </a>
            } @else {
              <a routerLink="/register"
                 class="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white
                        px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors text-lg font-semibold">
                Započni besplatno
              </a>
              <a routerLink="/login"
                 class="inline-flex items-center justify-center gap-2 bg-white text-gray-700
                        px-8 py-4 rounded-xl border border-gray-300 hover:bg-gray-50
                        transition-colors text-lg font-semibold">
                Prijavi se
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Decorative elements -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply
                  filter blur-xl opacity-30 animate-blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply
                  filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Sve što vam treba za uspešan projekat</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Jednostavan i intuitivan interfejs sa svim funkcijama koje vaš tim treba.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (feature of features; track feature.title) {
            <div class="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300
                        hover:shadow-lg group">
              <div class="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6
                          group-hover:bg-indigo-600 transition-colors">
                <ng-icon [name]="feature.icon"
                         class="text-2xl text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Kako funkcioniše?</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (step of steps; track step.number) {
            <div class="text-center">
              <div class="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center
                          justify-center text-xl font-bold mx-auto mb-4">
                {{ step.number }}
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-gray-600">{{ step.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    @if (!auth.isAuthenticated()) {
      <section class="py-20 bg-indigo-600">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">
            Spremni da povećate produktivnost?
          </h2>
          <p class="text-indigo-100 mb-8 text-lg">
            Pridružite se hiljadama timova koji koriste Taskify za upravljanje projektima.
          </p>
          <a routerLink="/register"
             class="inline-flex items-center justify-center gap-2 bg-white text-indigo-600
                    px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg font-semibold">
            Kreiraj besplatan nalog
          </a>
        </div>
      </section>
    }
  `,
  styles: [`
    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
  `],
})
export class HomeComponent {
  auth = inject(AuthService);

  features = [
    {
      icon: 'featherTrello',
      title: 'Kanban tabla',
      description: 'Vizualizujte radni tok sa drag & drop kolonama. Lako premještajte zadatke kroz faze.',
    },
    {
      icon: 'featherUsers',
      title: 'Timska saradnja',
      description: 'Dodeljujte zadatke članovima tima, komentarišite i pratite napredak u realnom vremenu.',
    },
    {
      icon: 'featherCalendar',
      title: 'Rokovi i podsetnici',
      description: 'Nikad ne propustite rok. Postavite due date i primajte notifikacije na vreme.',
    },
    {
      icon: 'featherCheckSquare',
      title: 'Checkliste',
      description: 'Podelite velike zadatke na manje korake i pratite napredak sa checklist-ama.',
    },
    {
      icon: 'featherBell',
      title: 'Notifikacije',
      description: 'Budite u toku sa svim promenama. Email i in-app notifikacije za važne događaje.',
    },
    {
      icon: 'featherZap',
      title: 'Brz i jednostavan',
      description: 'Intuitivan interfejs koji ne zahteva obuku. Počnite da radite za nekoliko minuta.',
    },
  ];

  steps = [
    {
      number: 1,
      title: 'Kreirajte projekat',
      description: 'Napravite novi projekat i pozovite članove vašeg tima.',
    },
    {
      number: 2,
      title: 'Organizujte zadatke',
      description: 'Dodajte zadatke na Kanban tablu i organizujte ih po prioritetu.',
    },
    {
      number: 3,
      title: 'Pratite napredak',
      description: 'Premještajte zadatke kroz kolone i pratite napredak projekta.',
    },
  ];
}
