// ============================================================================
// TASKIFY - Kanban Board Page Component
// ============================================================================

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  featherPlus,
  featherMoreVertical,
  featherArrowLeft,
  featherEdit2,
  featherTrash2,
  featherClock,
  featherAlertCircle,
} from '@ng-icons/feather-icons';
import { BoardsService, TasksService } from '../../core/services';
import { Task, Column, CreateTaskDto, Priority } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIconComponent, CdkDropListGroup, CdkDropList, CdkDrag, ModalComponent, InputComponent, ButtonComponent],
  viewProviders: [
    provideIcons({
      featherPlus,
      featherMoreVertical,
      featherArrowLeft,
      featherEdit2,
      featherTrash2,
      featherClock,
      featherAlertCircle,
    }),
  ],
  template: `
    <div class="h-[calc(100vh-64px)] flex flex-col bg-gray-100">
      @if (boardsService.loading()) {
        <div class="flex items-center justify-center flex-1">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (boardsService.currentBoard(); as board) {
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <a [routerLink]="['/projects', board.projectId]"
             class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ng-icon name="featherArrowLeft" class="text-xl" />
          </a>
          <h1 class="text-xl font-bold text-gray-900 flex-1">{{ board.name }}</h1>
          <app-button (click)="showColumnModal.set(true)">
            <ng-icon name="featherPlus" />
            Nova kolona
          </app-button>
        </div>

        <!-- Kanban Board -->
        <div class="flex-1 overflow-x-auto p-4" cdkDropListGroup>
          <div class="flex gap-4 h-full">
            @for (column of board.columns; track column.id) {
              <div class="w-80 flex-shrink-0 bg-gray-200 rounded-xl flex flex-col max-h-full">
                <!-- Column Header -->
                <div class="p-3 flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" [style.background-color]="column.color"></div>
                  <h3 class="font-semibold text-gray-800 flex-1">{{ column.name }}</h3>
                  <span class="text-sm text-gray-500">{{ column.tasks?.length || 0 }}</span>
                  <div class="relative">
                    <button (click)="toggleColumnMenu(column.id)"
                            class="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <ng-icon name="featherMoreVertical" />
                    </button>
                    @if (activeColumnMenu() === column.id) {
                      <div class="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border
                                  border-gray-200 py-1 z-20">
                        <button (click)="editColumn(column)"
                                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700
                                       hover:bg-gray-50">
                          <ng-icon name="featherEdit2" />
                          Izmeni
                        </button>
                        <button (click)="deleteColumn(column)"
                                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600
                                       hover:bg-red-50">
                          <ng-icon name="featherTrash2" />
                          Obriši
                        </button>
                      </div>
                    }
                  </div>
                </div>

                <!-- Tasks List -->
                <div class="flex-1 overflow-y-auto px-3 pb-3"
                     cdkDropList
                     [cdkDropListData]="column.tasks || []"
                     (cdkDropListDropped)="onTaskDrop($event, column)">
                  @for (task of column.tasks; track task.id) {
                    <div cdkDrag
                         (click)="openTaskModal(task)"
                         class="bg-white rounded-lg p-3 mb-2 shadow-sm hover:shadow-md
                                transition-shadow cursor-pointer border border-gray-100
                                active:shadow-lg">
                      <!-- Title -->
                      <h4 class="font-medium text-gray-900 mb-2">{{ task.title }}</h4>

                      <!-- Meta -->
                      <div class="flex items-center gap-3 text-xs text-gray-500">
                        @if (task.dueDate) {
                          <span class="flex items-center gap-1"
                                [class.text-red-500]="isOverdue(task.dueDate)"
                                [class.text-orange-500]="isDueSoon(task.dueDate) && !isOverdue(task.dueDate)">
                            <ng-icon name="featherClock" />
                            {{ formatDate(task.dueDate) }}
                          </span>
                        }
                      </div>

                      <!-- Priority Badge -->
                      @if (task.priority !== 'MEDIUM') {
                        <div class="mt-2">
                          <span class="px-2 py-0.5 text-xs rounded-full"
                                [class.bg-red-100]="task.priority === 'URGENT'"
                                [class.text-red-700]="task.priority === 'URGENT'"
                                [class.bg-orange-100]="task.priority === 'HIGH'"
                                [class.text-orange-700]="task.priority === 'HIGH'"
                                [class.bg-green-100]="task.priority === 'LOW'"
                                [class.text-green-700]="task.priority === 'LOW'">
                            {{ getPriorityLabel(task.priority) }}
                          </span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Add Task Button -->
                  <button (click)="openNewTaskModal(column)"
                          class="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100
                                 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <ng-icon name="featherPlus" />
                    Dodaj task
                  </button>
                </div>
              </div>
            }

            <!-- Add Column Placeholder -->
            <button (click)="showColumnModal.set(true)"
                    class="w-80 flex-shrink-0 bg-gray-200/50 border-2 border-dashed border-gray-300
                           rounded-xl flex items-center justify-center gap-2 text-gray-500
                           hover:text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-colors">
              <ng-icon name="featherPlus" />
              Dodaj kolonu
            </button>
          </div>
        </div>

        <!-- Column Modal -->
        @if (showColumnModal()) {
          <app-modal [title]="editingColumn() ? 'Izmeni kolonu' : 'Nova kolona'" (closed)="closeColumnModal()">
            <form (ngSubmit)="saveColumn()" class="p-4 space-y-4">
              <app-input label="Naziv" [(value)]="columnForm.name" [required]="true" />

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Boja</label>
                <div class="flex gap-2">
                  @for (color of columnColors; track color) {
                    <button type="button"
                            (click)="columnForm.color = color"
                            [class.ring-2]="columnForm.color === color"
                            class="w-8 h-8 rounded-full ring-gray-400 ring-offset-2"
                            [style.background-color]="color">
                    </button>
                  }
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <app-button variant="secondary" class="flex-1" (click)="closeColumnModal()">
                  Otkaži
                </app-button>
                <app-button type="submit" class="flex-1" [disabled]="!columnForm.name">
                  {{ editingColumn() ? 'Sačuvaj' : 'Kreiraj' }}
                </app-button>
              </div>
            </form>
          </app-modal>
        }

        <!-- Task Modal -->
        @if (showTaskModal()) {
          <app-modal [title]="editingTask() ? 'Izmeni task' : 'Novi task'" maxWidth="max-w-lg"
                     (closed)="closeTaskModal()">
            <form (ngSubmit)="saveTask()" class="p-4 space-y-4">
              <app-input label="Naslov" [(value)]="taskForm.title" [required]="true" />
              <app-input label="Opis" [(value)]="taskForm.description" [rows]="3" />

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Prioritet</label>
                  <select [(ngModel)]="taskForm.priority"
                          name="priority"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="LOW">Nizak</option>
                    <option value="MEDIUM">Srednji</option>
                    <option value="HIGH">Visok</option>
                    <option value="URGENT">Hitan</option>
                  </select>
                </div>

                <app-input label="Rok" type="date" [(value)]="taskForm.dueDate" />
              </div>

              <div class="flex gap-3 pt-4">
                <app-button variant="secondary" class="flex-1" (click)="closeTaskModal()">
                  Otkaži
                </app-button>
                @if (editingTask()) {
                  <app-button variant="danger" (click)="deleteTask()">Obriši</app-button>
                }
                <app-button type="submit" class="flex-1" [disabled]="!taskForm.title">
                  {{ editingTask() ? 'Sačuvaj' : 'Kreiraj' }}
                </app-button>
              </div>
            </form>
          </app-modal>
        }
      }
    </div>
  `,
  styles: [`
    .cdk-drag-preview {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-radius: 0.5rem;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
})
export class BoardComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  boardsService = inject(BoardsService);
  tasksService = inject(TasksService);

  showColumnModal = signal(false);
  showTaskModal = signal(false);
  editingColumn = signal<Column | null>(null);
  editingTask = signal<Task | null>(null);
  selectedColumn = signal<Column | null>(null);
  activeColumnMenu = signal<number | null>(null);

  columnForm = { name: '', color: '#6b7280' };
  taskForm: CreateTaskDto & { dueDate?: string } = {
    title: '',
    description: '',
    columnId: 0,
    priority: 'MEDIUM' as Priority,
    dueDate: '',
  };

  columnColors = ['#6b7280', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'];

  ngOnInit() {
    const boardId = Number(this.route.snapshot.paramMap.get('id'));
    this.boardsService.get(boardId).subscribe();

    document.addEventListener('click', () => this.activeColumnMenu.set(null));
  }

  ngOnDestroy() {
    this.boardsService.clearCurrent();
  }

  toggleColumnMenu(columnId: number) {
    event?.stopPropagation();
    this.activeColumnMenu.update((id) => (id === columnId ? null : columnId));
  }

  // ===== COLUMN OPERATIONS =====

  editColumn(column: Column) {
    this.editingColumn.set(column);
    this.columnForm = { name: column.name, color: column.color };
    this.activeColumnMenu.set(null);
    this.showColumnModal.set(true);
  }

  deleteColumn(column: Column) {
    this.activeColumnMenu.set(null);
    if (confirm(`Da li ste sigurni da želite da obrišete kolonu "${column.name}"?`)) {
      this.boardsService.deleteColumn(column.id).subscribe();
    }
  }

  closeColumnModal() {
    this.showColumnModal.set(false);
    this.editingColumn.set(null);
    this.columnForm = { name: '', color: '#6b7280' };
  }

  saveColumn() {
    const board = this.boardsService.currentBoard();
    if (!board) return;

    const editing = this.editingColumn();
    if (editing) {
      this.boardsService.updateColumn(editing.id, this.columnForm).subscribe(() => {
        this.closeColumnModal();
      });
    } else {
      this.boardsService.createColumn(board.id, this.columnForm).subscribe(() => {
        this.closeColumnModal();
      });
    }
  }

  // ===== TASK OPERATIONS =====

  openNewTaskModal(column: Column) {
    this.selectedColumn.set(column);
    this.editingTask.set(null);
    this.taskForm = {
      title: '',
      description: '',
      columnId: column.id,
      priority: 'MEDIUM',
      dueDate: '',
    };
    this.showTaskModal.set(true);
  }

  openTaskModal(task: Task) {
    this.editingTask.set(task);
    this.taskForm = {
      title: task.title,
      description: task.description || '',
      columnId: task.columnId,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    };
    this.showTaskModal.set(true);
  }

  closeTaskModal() {
    this.showTaskModal.set(false);
    this.editingTask.set(null);
    this.selectedColumn.set(null);
  }

  saveTask() {
    const editing = this.editingTask();
    const payload = {
      ...this.taskForm,
      dueDate: this.taskForm.dueDate || undefined,
    };

    if (editing) {
      this.tasksService.update(editing.id, payload).subscribe(() => {
        this.reloadBoard();
        this.closeTaskModal();
      });
    } else {
      this.tasksService.create(payload).subscribe(() => {
        this.reloadBoard();
        this.closeTaskModal();
      });
    }
  }

  deleteTask() {
    const task = this.editingTask();
    if (!task) return;

    if (confirm('Da li ste sigurni da želite da obrišete ovaj task?')) {
      this.tasksService.delete(task.id).subscribe(() => {
        this.reloadBoard();
        this.closeTaskModal();
      });
    }
  }

  // ===== DRAG & DROP =====

  onTaskDrop(event: CdkDragDrop<Task[]>, targetColumn: Column) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const task = event.container.data[event.currentIndex];
    this.tasksService.move(task.id, {
      columnId: targetColumn.id,
      position: event.currentIndex,
    }).subscribe();
  }

  // ===== HELPERS =====

  reloadBoard() {
    const board = this.boardsService.currentBoard();
    if (board) {
      this.boardsService.get(board.id).subscribe();
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'short' });
  }

  isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  isDueSoon(dateStr: string): boolean {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 2 && days >= 0;
  }

  getPriorityLabel(priority: Priority): string {
    const labels: Record<Priority, string> = {
      LOW: 'Nizak',
      MEDIUM: 'Srednji',
      HIGH: 'Visok',
      URGENT: 'Hitno',
    };
    return labels[priority];
  }
}
