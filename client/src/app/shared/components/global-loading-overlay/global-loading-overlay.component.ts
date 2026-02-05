// ============================================================================
// TASKIFY - Global Loading Overlay Component
// ============================================================================

import { Component, inject, computed } from '@angular/core';
import { AuthService, ProjectsService, BoardsService } from '../../../core/services';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-global-loading-overlay',
  standalone: true,
  imports: [LoadingOverlayComponent],
  template: `
    @if (isLoading()) {
      <app-loading-overlay />
    }
  `,
})
export class GlobalLoadingOverlayComponent {
  private auth = inject(AuthService);
  private projects = inject(ProjectsService);
  private boards = inject(BoardsService);

  isLoading = computed(() => {
    return (
      this.auth.status() === 'loading' ||
      this.projects.loading() ||
      this.boards.loading()
    );
  });
}
