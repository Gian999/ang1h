import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverService } from '../../../../core/services/driver.service';

@Component({
  selector: 'app-driver-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-emphasis to-orange-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div class="inline-block bg-emphasis/10 p-4 rounded-full mb-4">
            <svg class="w-12 h-12 text-emphasis" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Acceso Conductores</h1>
          <p class="text-gray-600">Sistema de verificación en 2 pasos</p>
        </div>

        <!-- Paso 1: Credenciales -->
        <div *ngIf="currentStep() === 1">
          <form (ngSubmit)="sendCode()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">DNI o Correo Electrónico</label>
                <input 
                  type="text" 
                  [(ngModel)]="identifier" 
                  name="identifier"
                  placeholder="12345678 o email@ejemplo.com"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent transition-all"
                  required
                  autofocus
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <input 
                  type="password" 
                  [(ngModel)]="password" 
                  name="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent transition-all"
                  required
                >
              </div>

              <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-shake">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{{ errorMessage() }}</span>
                </div>
              </div>

              <button
                type="submit"
                [disabled]="isLoading()"
                class="w-full px-6 py-3 bg-emphasis text-white rounded-lg hover:bg-orange-600 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <span *ngIf="!isLoading()">Enviar código de verificación →</span>
                <span *ngIf="isLoading()" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Paso 2: Verificación 2FA -->
        <div *ngIf="currentStep() === 2">
          <div class="mb-6">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-green-800">Código enviado por WhatsApp</p>
                  <p class="text-sm text-green-700 mt-1">Al número: {{ maskedPhone() }}</p>
                </div>
              </div>
            </div>
          </div>

          <form (ngSubmit)="verifyAndLogin()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Código de Verificación</label>
                <input 
                  type="text" 
                  [(ngModel)]="verificationCode" 
                  name="verificationCode"
                  placeholder="000000"
                  maxlength="6"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  class="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-emphasis text-center text-2xl font-bold tracking-widest transition-all"
                  required
                  autofocus
                >
                <p class="text-xs text-gray-500 text-center mt-2">Ingrese el código de 6 dígitos</p>
              </div>

              <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-shake">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{{ errorMessage() }}</span>
                </div>
              </div>

              <button
                type="submit"
                [disabled]="isLoading() || verificationCode.length !== 6"
                class="w-full px-6 py-3 bg-emphasis text-white rounded-lg hover:bg-orange-600 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <span *ngIf="!isLoading()">Verificar e Iniciar Sesión ✓</span>
                <span *ngIf="isLoading()" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              </button>

              <button
                type="button"
                (click)="backToStep1()"
                class="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium active:scale-95"
              >
                ← Cambiar credenciales
              </button>
            </div>
          </form>
        </div>

        <!-- Tarjeta de credenciales de demo -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex-1">
              <p class="text-sm font-semibold text-blue-800 mb-2">Credenciales de Demo:</p>
              <div class="text-xs text-blue-700 space-y-1 font-mono">
                <p>DNI: <span class="font-bold">87654321</span></p>
                <p>Contraseña: <span class="font-bold">conductor123</span></p>
                <p>Código 2FA: <span class="font-bold">123456</span></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Links adicionales -->
        <div class="mt-6 space-y-3">
          <div class="text-center">
            <a routerLink="/driver/register" class="text-emphasis hover:text-orange-600 text-sm font-medium">
              ¿No tienes cuenta? Regístrate aquí →
            </a>
          </div>
          
          <div class="text-center pt-3 border-t border-gray-200">
            <a routerLink="/driver" class="text-gray-600 hover:text-gray-800 text-sm font-medium">
              ← Volver a inicio de conductores
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DriverLoginComponent {
  currentStep = signal(1);
  isLoading = signal(false);
  errorMessage = signal('');
  maskedPhone = signal('');

  identifier = '';
  password = '';
  verificationCode = '';

  constructor(
    private driverService: DriverService,
    private router: Router
  ) {}

  sendCode() {
    this.errorMessage.set('');
    
    if (!this.identifier || !this.password) {
      this.errorMessage.set('Por favor complete todos los campos');
      return;
    }

    this.isLoading.set(true);

    // Simular envío de código
    setTimeout(() => {
      this.driverService.sendVerificationCode(this.identifier).subscribe({
        next: (phone) => {
          this.maskedPhone.set(phone);
          this.currentStep.set(2);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Error al enviar el código');
          this.isLoading.set(false);
        }
      });
    }, 1500);
  }

  verifyAndLogin() {
    this.errorMessage.set('');

    if (this.verificationCode.length !== 6) {
      this.errorMessage.set('El código debe tener 6 dígitos');
      return;
    }

    this.isLoading.set(true);

    // Simular verificación
    setTimeout(() => {
      this.driverService.login(this.identifier, this.password, this.verificationCode).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/driver/map']);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Código de verificación inválido');
          this.isLoading.set(false);
        }
      });
    }, 1500);
  }

  backToStep1() {
    this.currentStep.set(1);
    this.verificationCode = '';
    this.errorMessage.set('');
  }
}
