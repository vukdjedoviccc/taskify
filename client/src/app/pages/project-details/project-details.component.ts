// ============================================================================
// TASKIFY - Project Details Page Component
// ============================================================================

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  featherPlus,
  featherTrello,
  featherUsers,
  featherSettings,
  featherArrowLeft,
  featherTrash2,
  featherUserPlus,
  featherUserMinus,
} from '@ng-icons/feather-icons';
import { ProjectsService, BoardsService, AuthService } from '../../core/services';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIconComponent, ModalComponent, InputComponent, ButtonComponent],
  viewProviders: [
    provideIcons({
      featherPlus,
      featherTrello,
      featherUsers,
      featherSettings,
      featherArrowLeft,
      featherTrash2,
      featherUserPlus,
      featherUserMinus,
    }),
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (projectsService.loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (projectsService.currentProject(); as project) {
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/projects"
             class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ng-icon name="featherArrowLeft" class="text-xl" />
          </a>
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded" [style.background-color]="project.color"></div>
              <h1 class="text-2xl font-bold text-gray-900">{{ project.name }}</h1>
            </div>
            @if (project.description) {
              <p class="text-gray-600 mt-1">{{ project.description }}</p>
            }
          </div>
          <app-button variant="secondary" (click)="showMembersModal.set(true)">
            <ng-icon name="featherUsers" />
            <span>Članovi ({{ project.members?.length || 0 }})</span>
          </app-button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <div class="flex gap-6">
            <button (click)="activeTab.set('boards')"
                    [class.border-indigo-600]="activeTab() === 'boards'"
                    [class.text-indigo-600]="activeTab() === 'boards'"
                    [class.border-transparent]="activeTab() !== 'boards'"
                    class="pb-3 border-b-2 font-medium transition-colors">
              <ng-icon name="featherTrello" class="inline mr-2" />
              Boards
            </button>
            <button (click)="activeTab.set('settings')"
                    [class.border-indigo-600]="activeTab() === 'settings'"
                    [class.text-indigo-600]="activeTab() === 'settings'"
                    [class.border-transparent]="activeTab() !== 'settings'"
                    class="pb-3 border-b-2 font-medium transition-colors">
              <ng-icon name="featherSettings" class="inline mr-2" />
              Podešavanja
            </button>
          </div>
        </div>

        <!-- Boards Tab -->
        @if (activeTab() === 'boards') {
          <div class="mb-6">
            <app-button (click)="showBoardModal.set(true)">
              <ng-icon name="featherPlus" />
              Novi board
            </app-button>
          </div>

          @if (boardsService.boards().length === 0) {
            <div class="text-center py-12 bg-gray-50 rounded-xl">
              <ng-icon name="featherTrello" class="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">Nema board-ova</h3>
              <p class="text-gray-600">Kreirajte prvi Kanban board za ovaj projekat</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (board of boardsService.boards(); track board.id) {
                <a [routerLink]="['/boards', board.id]"
                   class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg
                          transition-shadow group">
                  <div class="flex items-center gap-3 mb-3">
                    <ng-icon name="featherTrello" class="text-2xl text-indigo-600" />
                    <h3 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600
                               transition-colors">
                      {{ board.name }}
                    </h3>
                  </div>
                  <p class="text-gray-500 text-sm">
                    {{ board._count?.columns || 0 }} kolona
                  </p>
                </a>
              }
            </div>
          }
        }

        <!-- Settings Tab -->
        @if (activeTab() === 'settings') {
          <div class="max-w-xl bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Podešavanja projekta</h3>

            <div class="space-y-4">
              <app-input label="Naziv" [(value)]="settingsForm.name" />
              <app-input label="Opis" [(value)]="settingsForm.description" [rows]="3" />

              <app-button (click)="saveSettings()">Sačuvaj promene</app-button>
            </div>
          </div>
        }

        <!-- Members Modal -->
        @if (showMembersModal()) {
          <app-modal title="Članovi projekta" (closed)="showMembersModal.set(false)">
            <!-- Add member -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex gap-2">
                <input type="email"
                       [(ngModel)]="newMemberEmail"
                       placeholder="Email novog člana"
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                <app-button (click)="addMember()" [disabled]="!newMemberEmail">
                  <ng-icon name="featherUserPlus" />
                </app-button>
              </div>
            </div>

            <!-- Members list -->
            <div class="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              @for (member of project.members; track member.userId) {
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                       [style.background-color]="getAvatarColor(member.user.name)">
                    {{ member.user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ member.user.name }}</p>
                    <p class="text-sm text-gray-500">{{ member.user.email }}</p>
                  </div>
                  <span class="px-2 py-1 text-xs rounded-full"
                        [class.bg-purple-100]="member.role === 'OWNER'"
                        [class.text-purple-700]="member.role === 'OWNER'"
                        [class.bg-blue-100]="member.role === 'MANAGER'"
                        [class.text-blue-700]="member.role === 'MANAGER'"
                        [class.bg-gray-100]="member.role === 'MEMBER'"
                        [class.text-gray-700]="member.role === 'MEMBER'">
                    {{ member.role }}
                  </span>
                  @if (canRemoveMember(member)) {
                    <button (click)="removeMember(member.userId)"
                            class="p-1 text-red-500 hover:text-red-700">
                      <ng-icon name="featherUserMinus" />
                    </button>
                  }
                </div>
              }
            </div>
          </app-modal>
        }

        <!-- Create Board Modal -->
        @if (showBoardModal()) {
          <app-modal title="Novi board" (closed)="showBoardModal.set(false)">
            <form (ngSubmit)="createBoard()" class="p-4 space-y-4">
              <app-input label="Naziv board-a" [(value)]="newBoardName" [required]="true" />

              <div class="flex gap-3 pt-4">
                <app-button variant="secondary" class="flex-1" (click)="showBoardModal.set(false)">
                  Otkaži
                </app-button>
                <app-button type="submit" class="flex-1" [disabled]="!newBoardName">Kreiraj</app-button>
              </div>
            </form>
          </app-modal>
        }
      }
    </div>
  `,
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  projectsService = inject(ProjectsService);
  boardsService = inject(BoardsService);
  auth = inject(AuthService);

  activeTab = signal<'boards' | 'settings'>('boards');
  showMembersModal = signal(false);
  showBoardModal = signal(false);

  newMemberEmail = '';
  newBoardName = '';

  settingsForm = {
    name: '',
    description: '',
  };

  ngOnInit() {
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject(projectId);
  }

  ngOnDestroy() {
    this.projectsService.clearCurrent();
    this.boardsService.clearCurrent();
  }

  loadProject(projectId: number) {
    this.projectsService.get(projectId).subscribe((project) => {
      this.settingsForm = {
        name: project.name,
        description: project.description || '',
      };
      this.boardsService.list(projectId).subscribe();
    });
  }

  createBoard() {
    const project = this.projectsService.currentProject();
    if (!project || !this.newBoardName) return;

    this.boardsService.create(project.id, { name: this.newBoardName }).subscribe(() => {
      this.newBoardName = '';
      this.showBoardModal.set(false);
    });
  }

  addMember() {
    const project = this.projectsService.currentProject();
    if (!project || !this.newMemberEmail) return;

    this.projectsService.addMember(project.id, { email: this.newMemberEmail }).subscribe({
      next: () => {
        this.newMemberEmail = '';
        this.loadProject(project.id);
      },
      error: (err) => {
        alert(err.error?.message || 'Greška pri dodavanju člana');
      },
    });
  }

  removeMember(userId: number) {
    const project = this.projectsService.currentProject();
    if (!project) return;

    if (confirm('Da li ste sigurni da želite da uklonite ovog člana?')) {
      this.projectsService.removeMember(project.id, userId).subscribe();
    }
  }

  canRemoveMember(member: any): boolean {
    if (member.role === 'OWNER') return false;
    const currentUser = this.auth.user();
    const project = this.projectsService.currentProject();
    if (!currentUser || !project) return false;

    const currentMember = project.members?.find((m) => m.userId === currentUser.id);
    return currentMember?.role === 'OWNER' || this.auth.isAdmin();
  }

  saveSettings() {
    const project = this.projectsService.currentProject();
    if (!project) return;

    this.projectsService.update(project.id, this.settingsForm).subscribe();
  }

  getAvatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#22c55e'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
