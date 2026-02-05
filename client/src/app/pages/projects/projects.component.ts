// ============================================================================
// TASKIFY - Projects Page Component
// ============================================================================

import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  featherPlus,
  featherSearch,
  featherFolder,
  featherUsers,
  featherTrello,
  featherMoreVertical,
  featherEdit2,
  featherTrash2,
  featherArchive,
} from '@ng-icons/feather-icons';
import { ProjectsService, AuthService } from '../../core/services';
import { Project, CreateProjectDto } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIconComponent, ModalComponent, InputComponent, ButtonComponent],
  viewProviders: [
    provideIcons({
      featherPlus,
      featherSearch,
      featherFolder,
      featherUsers,
      featherTrello,
      featherMoreVertical,
      featherEdit2,
      featherTrash2,
      featherArchive,
    }),
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Moji projekti</h1>
          <p class="text-gray-600">Upravljajte vašim projektima i timovima</p>
        </div>
        <app-button (click)="openCreateModal()">
          <ng-icon name="featherPlus" class="text-lg" />
          Novi projekat
        </app-button>
      </div>

      <!-- Search -->
      <div class="relative mb-6">
        <ng-icon name="featherSearch" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text"
               [(ngModel)]="searchQuery"
               (ngModelChange)="onSearch()"
               placeholder="Pretraži projekte..."
               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>

      <!-- Loading -->
      @if (projectsService.loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <!-- Projects Grid -->
        @if (projectsService.projects().length === 0) {
          <div class="text-center py-12 bg-gray-50 rounded-xl">
            <ng-icon name="featherFolder" class="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Nema projekata</h3>
            <p class="text-gray-600 mb-4">Kreirajte vaš prvi projekat da započnete</p>
            <app-button (click)="openCreateModal()">
              <ng-icon name="featherPlus" class="text-lg" />
              Novi projekat
            </app-button>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (project of projectsService.projects(); track project.id) {
              <div class="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow
                          overflow-hidden group">
                <!-- Color bar -->
                <div class="h-2" [style.background-color]="project.color"></div>

                <div class="p-5">
                  <!-- Header -->
                  <div class="flex items-start justify-between mb-3">
                    <a [routerLink]="['/projects', project.id]"
                       class="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                      {{ project.name }}
                    </a>
                    <div class="relative">
                      <button (click)="toggleMenu(project.id)"
                              class="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0
                                     group-hover:opacity-100 transition-opacity">
                        <ng-icon name="featherMoreVertical" />
                      </button>
                      @if (activeMenu() === project.id) {
                        <div class="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border
                                    border-gray-200 py-1 z-10">
                          <button (click)="openEditModal(project)"
                                  class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700
                                         hover:bg-gray-50">
                            <ng-icon name="featherEdit2" />
                            Izmeni
                          </button>
                          <button (click)="archiveProject(project)"
                                  class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700
                                         hover:bg-gray-50">
                            <ng-icon name="featherArchive" />
                            {{ project.isArchived ? 'Aktiviraj' : 'Arhiviraj' }}
                          </button>
                          <button (click)="deleteProject(project)"
                                  class="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600
                                         hover:bg-red-50">
                            <ng-icon name="featherTrash2" />
                            Obriši
                          </button>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Description -->
                  @if (project.description) {
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ project.description }}</p>
                  }

                  <!-- Stats -->
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                      <ng-icon name="featherTrello" />
                      <span>{{ project._count?.boards || 0 }} board</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <ng-icon name="featherUsers" />
                      <span>{{ project.members?.length || 0 }} članova</span>
                    </div>
                  </div>

                  <!-- Members avatars -->
                  @if (project.members && project.members.length > 0) {
                    <div class="flex -space-x-2 mt-4">
                      @for (member of project.members.slice(0, 5); track member.userId) {
                        <div class="w-8 h-8 rounded-full border-2 border-white flex items-center
                                    justify-center text-xs font-medium"
                             [style.background-color]="getAvatarColor(member.user.name)"
                             [title]="member.user.name">
                          {{ member.user.name.charAt(0).toUpperCase() }}
                        </div>
                      }
                      @if (project.members.length > 5) {
                        <div class="w-8 h-8 rounded-full border-2 border-white bg-gray-200
                                    flex items-center justify-center text-xs font-medium text-gray-600">
                          +{{ project.members.length - 5 }}
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (projectsService.pagination().totalPages > 1) {
            <div class="flex items-center justify-center gap-2 mt-8">
              @for (page of pages(); track page) {
                <button (click)="goToPage(page)"
                        [class.bg-indigo-600]="page === projectsService.pagination().page"
                        [class.text-white]="page === projectsService.pagination().page"
                        [class.bg-white]="page !== projectsService.pagination().page"
                        [class.text-gray-700]="page !== projectsService.pagination().page"
                        class="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50
                               transition-colors font-medium">
                  {{ page }}
                </button>
              }
            </div>
          }
        }
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <app-modal [title]="editingProject() ? 'Izmeni projekat' : 'Novi projekat'" (closed)="closeModal()">
        <form (ngSubmit)="saveProject()" class="p-4 space-y-4">
          <app-input label="Naziv projekta" [(value)]="formData.name" [required]="true" />
          <app-input label="Opis (opciono)" [(value)]="formData.description" [rows]="3" />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Boja</label>
            <div class="flex gap-2">
              @for (color of colors; track color) {
                <button type="button"
                        (click)="formData.color = color"
                        [class.ring-2]="formData.color === color"
                        [class.ring-offset-2]="formData.color === color"
                        class="w-8 h-8 rounded-full ring-gray-400"
                        [style.background-color]="color">
                </button>
              }
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <app-button variant="secondary" class="flex-1" (click)="closeModal()">Otkaži</app-button>
            <app-button type="submit" class="flex-1" [disabled]="!formData.name">
              {{ editingProject() ? 'Sačuvaj' : 'Kreiraj' }}
            </app-button>
          </div>
        </form>
      </app-modal>
    }
  `,
})
export class ProjectsComponent implements OnInit {
  projectsService = inject(ProjectsService);
  auth = inject(AuthService);

  searchQuery = '';
  showModal = signal(false);
  editingProject = signal<Project | null>(null);
  activeMenu = signal<number | null>(null);

  formData: CreateProjectDto = {
    name: '',
    description: '',
    color: '#6366f1',
  };

  colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#06b6d4',
  ];

  ngOnInit() {
    this.loadProjects();

    // Close menu when clicking outside
    document.addEventListener('click', () => this.activeMenu.set(null));
  }

  loadProjects() {
    this.projectsService.list({ q: this.searchQuery }).subscribe();
  }

  onSearch() {
    this.loadProjects();
  }

  pages() {
    const { page, totalPages } = this.projectsService.pagination();
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    this.projectsService.list({ q: this.searchQuery, page }).subscribe();
  }

  toggleMenu(projectId: number) {
    event?.stopPropagation();
    this.activeMenu.update((id) => (id === projectId ? null : projectId));
  }

  openCreateModal() {
    this.editingProject.set(null);
    this.formData = { name: '', description: '', color: '#6366f1' };
    this.showModal.set(true);
  }

  openEditModal(project: Project) {
    this.editingProject.set(project);
    this.formData = {
      name: project.name,
      description: project.description || '',
      color: project.color,
    };
    this.activeMenu.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProject.set(null);
  }

  saveProject() {
    const editing = this.editingProject();
    if (editing) {
      this.projectsService.update(editing.id, this.formData).subscribe(() => {
        this.closeModal();
      });
    } else {
      this.projectsService.create(this.formData).subscribe(() => {
        this.closeModal();
      });
    }
  }

  archiveProject(project: Project) {
    this.activeMenu.set(null);
    this.projectsService.update(project.id, { isArchived: !project.isArchived }).subscribe();
  }

  deleteProject(project: Project) {
    this.activeMenu.set(null);
    if (confirm(`Da li ste sigurni da želite da obrišete projekat "${project.name}"?`)) {
      this.projectsService.delete(project.id).subscribe();
    }
  }

  getAvatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#22c55e'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
