import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 class="text-2xl font-bold text-gray-900 text-center mb-8">Create account</h1>

          @if (auth.error()) {
            <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              {{ auth.error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <app-input label="Name" type="text" [(value)]="form.name" [required]="true" />
              <app-input label="Email" type="email" [(value)]="form.email" [required]="true" />
              <app-input label="Password" type="password" [(value)]="form.password"
                         [required]="true" [minlength]="6" />

              <app-button type="submit" [fullWidth]="true" [loading]="auth.isLoading()"
                          loadingText="Creating account...">
                Sign Up
              </app-button>
            </div>
          </form>

          <p class="text-center text-gray-600 mt-6">
            Already have an account?
            <a routerLink="/login" class="text-indigo-600 hover:text-indigo-700 ml-1">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  form = {
    name: '',
    email: '',
    password: ''
  };

  onSubmit(): void {
    this.auth.register(this.form).subscribe({
      next: () => {
        this.router.navigate(['/']);
      }
    });
  }
}
