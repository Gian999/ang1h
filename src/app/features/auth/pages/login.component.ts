import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
            <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Bienvenido de vuelta</h1>
          <p class="text-gray-600">Ingresa a tu cuenta</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Identifier (DNI or Email) -->
            <div class="mb-4">
              <label for="identifier" class="block text-sm font-medium text-gray-700 mb-2">
                DNI o Email
              </label>
              <input
                id="identifier"
                type="text"
                formControlName="identifier"
                placeholder="12345678 o tu@email.com"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                [class.border-error]="loginForm.get('identifier')?.invalid && loginForm.get('identifier')?.touched"
              />
              <div *ngIf="loginForm.get('identifier')?.invalid && loginForm.get('identifier')?.touched" 
                   class="mt-1 text-sm text-error">
                Este campo es requerido
              </div>
            </div>

            <!-- Password -->
            <div class="mb-6">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-12"
                  [class.border-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                   class="mt-1 text-sm text-error">
                La contraseña es requerida
              </div>
            </div>

            <!-- Forgot Password -->
            <div class="mb-6 text-right">
              <a href="#" class="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mb-4 p-3 bg-error/10 border border-error rounded-lg">
              <p class="text-sm text-error">{{ errorMessage }}</p>
            </div>

            <!-- Demo Credentials -->
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-xs font-medium text-blue-900 mb-2">Credenciales de demostración:</p>
              <p class="text-xs text-blue-700">DNI: <span class="font-mono font-semibold">12345678</span></p>
              <p class="text-xs text-blue-700">Contraseña: <span class="font-mono font-semibold">demo123</span></p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading"
              class="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <span *ngIf="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</span>
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              ¿No tienes una cuenta? 
              <a routerLink="/auth/register" class="text-primary font-medium hover:underline ml-1">
                Crear cuenta
              </a>
            </p>
          </div>
        </div>

        <!-- Back to Welcome -->
        <div class="mt-6 text-center">
          <a routerLink="/" class="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor() {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/card/my-card']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
        }
      });
    }
  }
}
