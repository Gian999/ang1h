import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DniInputComponent } from '../../../shared/components/dni-input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DniInputComponent],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <div class="max-w-lg w-full">
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Crear cuenta nueva</h1>
          <p class="text-gray-600">Completa los siguientes pasos para registrarte</p>
        </div>

        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Paso {{ currentStep }} de 3</span>
            <span class="text-sm text-gray-500">{{ getProgressPercentage() }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-primary h-2 rounded-full transition-all duration-300"
              [style.width.%]="getProgressPercentage()"
            ></div>
          </div>
        </div>

        <!-- Form Container -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            
            <!-- Step 1: Personal Data -->
            <div *ngIf="currentStep === 1" class="space-y-4">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Datos personales</h2>
              
              <app-dni-input
                formControlName="dni"
                [required]="true"
              ></app-dni-input>

              <div>
                <label for="nombres" class="block text-sm font-medium text-gray-700 mb-2">
                  Nombres <span class="text-error">*</span>
                </label>
                <input
                  id="nombres"
                  type="text"
                  formControlName="nombres"
                  placeholder="Juan Carlos"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  [class.border-error]="registerForm.get('nombres')?.invalid && registerForm.get('nombres')?.touched"
                />
              </div>

              <div>
                <label for="apellidos" class="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos <span class="text-error">*</span>
                </label>
                <input
                  id="apellidos"
                  type="text"
                  formControlName="apellidos"
                  placeholder="Mamani Quispe"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  [class.border-error]="registerForm.get('apellidos')?.invalid && registerForm.get('apellidos')?.touched"
                />
              </div>

              <div>
                <label for="fechaNacimiento" class="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de nacimiento <span class="text-error">*</span>
                </label>
                <input
                  id="fechaNacimiento"
                  type="date"
                  formControlName="fechaNacimiento"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  [class.border-error]="registerForm.get('fechaNacimiento')?.invalid && registerForm.get('fechaNacimiento')?.touched"
                  [max]="maxDate"
                />
              </div>
            </div>

            <!-- Step 2: Contact Data -->
            <div *ngIf="currentStep === 2" class="space-y-4">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Datos de contacto</h2>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email <span class="text-error">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  [class.border-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                />
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="mt-1 text-sm text-error">
                  Ingresa un email válido
                </div>
              </div>

              <div>
                <label for="celular" class="block text-sm font-medium text-gray-700 mb-2">
                  Celular <span class="text-error">*</span>
                </label>
                <div class="flex gap-2">
                  <div class="flex items-center px-4 py-3 border rounded-lg bg-gray-50 text-gray-600">
                    +51
                  </div>
                  <input
                    id="celular"
                    type="tel"
                    formControlName="celular"
                    placeholder="987654321"
                    maxlength="9"
                    class="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    [class.border-error]="registerForm.get('celular')?.invalid && registerForm.get('celular')?.touched"
                  />
                </div>
                <div *ngIf="registerForm.get('celular')?.invalid && registerForm.get('celular')?.touched" class="mt-1 text-sm text-error">
                  El celular debe tener 9 dígitos y comenzar con 9
                </div>
              </div>

              <div>
                <label for="distrito" class="block text-sm font-medium text-gray-700 mb-2">
                  Distrito <span class="text-error">*</span>
                </label>
                <select
                  id="distrito"
                  formControlName="distrito"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  [class.border-error]="registerForm.get('distrito')?.invalid && registerForm.get('distrito')?.touched"
                >
                  <option value="">Selecciona tu distrito</option>
                  <option value="Juliaca">Juliaca</option>
                  <option value="Puno">Puno</option>
                  <option value="San Román">San Román</option>
                  <option value="Azángaro">Azángaro</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <!-- Step 3: Security -->
            <div *ngIf="currentStep === 3" class="space-y-4">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Seguridad</h2>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña <span class="text-error">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="Mínimo 6 caracteres"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  [class.border-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                />
                <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="mt-1 text-sm text-error">
                  La contraseña debe tener al menos 6 caracteres
                </div>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña <span class="text-error">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Repite tu contraseña"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  [class.border-error]="passwordsMatch === false"
                />
                <div *ngIf="passwordsMatch === false" class="mt-1 text-sm text-error">
                  Las contraseñas no coinciden
                </div>
              </div>

              <div class="pt-2">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="acceptTerms"
                    class="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">
                    Acepto los <a href="#" class="text-primary hover:underline">términos y condiciones</a> de uso de la plataforma
                    <span class="text-error">*</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mt-4 p-3 bg-error/10 border border-error rounded-lg">
              <p class="text-sm text-error">{{ errorMessage }}</p>
            </div>

            <!-- Navigation Buttons -->
            <div class="mt-6 flex gap-3">
              <button
                *ngIf="currentStep > 1"
                type="button"
                (click)="previousStep()"
                class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Anterior
              </button>
              
              <button
                *ngIf="currentStep < 3"
                type="button"
                (click)="nextStep()"
                [disabled]="!isCurrentStepValid()"
                class="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
              </button>

              <button
                *ngIf="currentStep === 3"
                type="submit"
                [disabled]="registerForm.invalid || loading || !passwordsMatch"
                class="flex-1 py-3 bg-success text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <span *ngIf="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}</span>
              </button>
            </div>
          </form>

          <!-- Login Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              ¿Ya tienes una cuenta? 
              <a routerLink="/auth/login" class="text-primary font-medium hover:underline ml-1">
                Iniciar sesión
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  currentStep = 1;
  loading = false;
  errorMessage = '';
  maxDate: string;

  constructor() {
    // Set max date to 18 years ago
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    this.maxDate = today.toISOString().split('T')[0];

    this.registerForm = this.fb.group({
      // Step 1
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', [Validators.required]],
      // Step 2
      email: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      distrito: ['', [Validators.required]],
      // Step 3
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  get passwordsMatch(): boolean | null {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }

  getProgressPercentage(): number {
    return (this.currentStep / 3) * 100;
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(
          this.registerForm.get('dni')?.valid &&
          this.registerForm.get('nombres')?.valid &&
          this.registerForm.get('apellidos')?.valid &&
          this.registerForm.get('fechaNacimiento')?.valid
        );
      case 2:
        return !!(
          this.registerForm.get('email')?.valid &&
          this.registerForm.get('celular')?.valid &&
          this.registerForm.get('distrito')?.valid
        );
      case 3:
        return !!(
          this.registerForm.get('password')?.valid &&
          this.registerForm.get('confirmPassword')?.valid &&
          this.registerForm.get('acceptTerms')?.valid &&
          this.passwordsMatch
        );
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.isCurrentStepValid() && this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid && this.passwordsMatch) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;
      const registerData = {
        dni: formValue.dni,
        nombres: formValue.nombres,
        apellidos: formValue.apellidos,
        fechaNacimiento: new Date(formValue.fechaNacimiento),
        email: formValue.email,
        celular: formValue.celular,
        distrito: formValue.distrito,
        password: formValue.password
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.loading = false;
          // Show success message and navigate
          alert('¡Registro exitoso! Tu tarjeta virtual ha sido creada');
          this.router.navigate(['/card/my-card']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.';
        }
      });
    }
  }
}
