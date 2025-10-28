import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverService } from '../../../../core/services/driver.service';
import { DriverData } from '../../../../core/models/driver.model';

@Component({
  selector: 'app-driver-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .step-content {
      animation: fadeIn 0.3s ease-out;
    }
  `],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-emphasis to-orange-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div class="inline-block bg-emphasis/10 p-4 rounded-full mb-4">
            <svg class="w-12 h-12 text-emphasis" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Registro de Conductor</h1>
          <p class="text-gray-600">Complete el registro en 4 pasos simples</p>
        </div>

        <!-- Barra de progreso -->
        <div class="mb-8">
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium" [class.text-emphasis]="currentStep() >= 1" [class.text-gray-400]="currentStep() < 1">1. Conductor</span>
            <span class="text-sm font-medium" [class.text-emphasis]="currentStep() >= 2" [class.text-gray-400]="currentStep() < 2">2. Contacto</span>
            <span class="text-sm font-medium" [class.text-emphasis]="currentStep() >= 3" [class.text-gray-400]="currentStep() < 3">3. Vehículo</span>
            <span class="text-sm font-medium" [class.text-emphasis]="currentStep() >= 4" [class.text-gray-400]="currentStep() < 4">4. Seguridad</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-emphasis h-2 rounded-full transition-all duration-300" [style.width.%]="(currentStep() / 4) * 100"></div>
          </div>
        </div>

        <!-- Formulario -->
        <form (ngSubmit)="handleSubmit()">
          <!-- Paso 1: Datos del Conductor -->
          <div *ngIf="currentStep() === 1" class="space-y-4 step-content">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Datos del Conductor</h2>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">DNI *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.dni" 
                name="dni"
                placeholder="12345678"
                maxlength="8"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.nombres" 
                  name="nombres"
                  placeholder="Juan Carlos"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.apellidos" 
                  name="apellidos"
                  placeholder="Pérez García"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                  required
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Número de Licencia *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.licencia" 
                name="licencia"
                placeholder="A-II-12345678"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento *</label>
              <input 
                type="date" 
                [(ngModel)]="formData.fechaNacimiento" 
                name="fechaNacimiento"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>
          </div>

          <!-- Paso 2: Contacto -->
          <div *ngIf="currentStep() === 2" class="space-y-4 step-content">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Información de Contacto</h2>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico *</label>
              <input 
                type="email" 
                [(ngModel)]="formData.email" 
                name="email"
                placeholder="conductor@ejemplo.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Celular (WhatsApp) *</label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  value="+51" 
                  disabled
                  class="w-20 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-center font-semibold"
                >
                <input 
                  type="tel" 
                  [(ngModel)]="formData.celular" 
                  name="celular"
                  placeholder="987654321"
                  maxlength="9"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                  required
                >
              </div>
              <p class="text-xs text-gray-500 mt-1">Se enviará un código de verificación a este número</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input 
                type="text" 
                [(ngModel)]="formData.direccion" 
                name="direccion"
                placeholder="Jr. Los Andes 123, Juliaca"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
              >
            </div>
          </div>

          <!-- Paso 3: Vehículo -->
          <div *ngIf="currentStep() === 3" class="space-y-4 step-content">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Información del Vehículo</h2>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Placa del Vehículo *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.placa" 
                name="placa"
                placeholder="ABC-123"
                maxlength="7"
                (input)="formData.placa = formData.placa?.toUpperCase()"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent uppercase"
                required
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.modelo" 
                  name="modelo"
                  placeholder="Hyundai H100"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Año *</label>
                <input 
                  type="number" 
                  [(ngModel)]="formData.anio" 
                  name="anio"
                  placeholder="2020"
                  min="1990"
                  [max]="currentYear"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                  required
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Color *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.color" 
                name="color"
                placeholder="Blanco"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Capacidad de Pasajeros *</label>
              <input 
                type="number" 
                [(ngModel)]="formData.capacidad" 
                name="capacidad"
                placeholder="14"
                min="5"
                max="50"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Número de Ruta *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.numeroRuta" 
                name="numeroRuta"
                placeholder="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Empresa de Transporte *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.empresaTransporte" 
                name="empresaTransporte"
                placeholder="Transporte Santa Bárbara S.A."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>
          </div>

          <!-- Paso 4: Seguridad -->
          <div *ngIf="currentStep() === 4" class="space-y-4 step-content">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Configuración de Seguridad</h2>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
              <input 
                type="password" 
                [(ngModel)]="formData.password" 
                name="password"
                placeholder="••••••••"
                minlength="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
              <p class="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña *</label>
              <input 
                type="password" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emphasis focus:border-transparent"
                required
              >
            </div>

            <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {{ errorMessage() }}
            </div>

            <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <input 
                type="checkbox" 
                [(ngModel)]="acceptTerms" 
                name="acceptTerms"
                id="terms"
                class="mt-1 w-4 h-4 text-emphasis border-gray-300 rounded focus:ring-emphasis"
                required
              >
              <label for="terms" class="text-sm text-gray-700">
                Acepto los términos y condiciones del servicio de transporte. Confirmo que toda la información proporcionada es verídica y me comprometo a cumplir con las normas de tránsito.
              </label>
            </div>
          </div>

          <!-- Mensajes de error -->
          <div *ngIf="errorMessage() && currentStep() !== 4" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ errorMessage() }}
          </div>

          <!-- Botones de navegación -->
          <div class="flex gap-4 mt-8">
            <button
              type="button"
              *ngIf="currentStep() > 1"
              (click)="previousStep()"
              class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← Anterior
            </button>

            <button
              *ngIf="currentStep() < 4"
              type="button"
              (click)="nextStep()"
              class="flex-1 px-6 py-3 bg-emphasis text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-lg"
            >
              Siguiente →
            </button>

            <button
              *ngIf="currentStep() === 4"
              type="submit"
              [disabled]="isLoading()"
              class="flex-1 px-6 py-3 bg-emphasis text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isLoading()">Registrar Conductor</span>
              <span *ngIf="isLoading()">Registrando...</span>
            </button>
          </div>
        </form>

        <!-- Link de regreso -->
        <div class="mt-6 text-center">
          <a routerLink="/driver" class="text-emphasis hover:text-orange-600 text-sm font-medium">
            ← Volver a inicio de conductores
          </a>
        </div>
      </div>
    </div>
  `
})
export class DriverRegisterComponent {
  currentStep = signal(1);
  isLoading = signal(false);
  errorMessage = signal('');
  
  formData: DriverData = {
    dni: '',
    nombres: '',
    apellidos: '',
    licencia: '',
    fechaNacimiento: '',
    email: '',
    celular: '',
    direccion: '',
    placa: '',
    modelo: '',
    anio: 2024,
    color: '',
    capacidad: 14,
    numeroRuta: '',
    empresaTransporte: ''
  };

  confirmPassword = '';
  acceptTerms = false;
  currentYear = new Date().getFullYear();

  constructor(
    private driverService: DriverService,
    private router: Router
  ) {}

  nextStep() {
    this.errorMessage.set('');

    // Validación por paso
    if (this.currentStep() === 1) {
      if (!this.formData.dni || !this.formData.nombres || !this.formData.apellidos || 
          !this.formData.licencia || !this.formData.fechaNacimiento) {
        this.errorMessage.set('Por favor complete todos los campos obligatorios');
        return;
      }
      if (this.formData.dni.length !== 8) {
        this.errorMessage.set('El DNI debe tener 8 dígitos');
        return;
      }
    }

    if (this.currentStep() === 2) {
      if (!this.formData.email || !this.formData.celular) {
        this.errorMessage.set('Por favor complete todos los campos obligatorios');
        return;
      }
      if (this.formData.celular.length !== 9) {
        this.errorMessage.set('El número de celular debe tener 9 dígitos');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        this.errorMessage.set('Por favor ingrese un correo electrónico válido');
        return;
      }
    }

    if (this.currentStep() === 3) {
      if (!this.formData.placa || !this.formData.modelo || !this.formData.color || 
          !this.formData.numeroRuta || !this.formData.empresaTransporte) {
        this.errorMessage.set('Por favor complete todos los campos obligatorios');
        return;
      }
      const placaRegex = /^[A-Z]{3}-\d{3}$/;
      if (!placaRegex.test(this.formData.placa)) {
        this.errorMessage.set('La placa debe tener el formato ABC-123');
        return;
      }
      if ((this.formData.capacidad ?? 0) < 5 || (this.formData.capacidad ?? 0) > 50) {
        this.errorMessage.set('La capacidad debe estar entre 5 y 50 pasajeros');
        return;
      }
    }

    this.currentStep.set(this.currentStep() + 1);
  }

  previousStep() {
    this.errorMessage.set('');
    this.currentStep.set(this.currentStep() - 1);
  }

  handleSubmit() {
    this.errorMessage.set('');

    // Validaciones finales
    if (!this.formData.password) {
      this.errorMessage.set('Por favor ingrese una contraseña');
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage.set('Debe aceptar los términos y condiciones');
      return;
    }

    this.isLoading.set(true);

    // Llamar al servicio de registro
    this.driverService.register(this.formData, this.formData.password!)
      .subscribe({
        next: (driver) => {
          this.isLoading.set(false);
          alert('✅ Registro exitoso\n\nSu cuenta de conductor ha sido creada. Ahora puede iniciar sesión con su DNI o correo electrónico.');
          this.router.navigate(['/driver/login']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Error al registrar conductor');
        }
      });
  }
}
