import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-driver-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-emphasis to-amber-700 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <!-- Logo/Icon -->
        <div class="text-center mb-8">
          <div class="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <svg class="w-14 h-14 text-emphasis" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">
            Portal de Conductores
          </h1>
          <p class="text-amber-100 text-lg">Transporte Colectivo Inteligente</p>
        </div>

        <!-- Features -->
        <div class="space-y-3 mb-8">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white flex items-start gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold mb-1">Tracking GPS</h3>
              <p class="text-sm text-amber-100">Ubicación en tiempo real de tu recorrido</p>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white flex items-start gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold mb-1">Rutas OSRM</h3>
              <p class="text-sm text-amber-100">Optimización de recorrido inteligente</p>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white flex items-start gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold mb-1">Verificación</h3>
              <p class="text-sm text-amber-100">Autenticación segura con 2FA</p>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="space-y-3 mb-6">
          <a 
            routerLink="/driver/login"
            class="block w-full py-4 bg-white text-emphasis rounded-xl font-bold text-center text-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            Iniciar sesión
          </a>
          
          <a 
            routerLink="/driver/register"
            class="block w-full py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-center text-lg hover:bg-white/10 transition-colors"
          >
            Registrar mi microbus
          </a>
        </div>

        <!-- Link back to passenger portal -->
        <div class="text-center">
          <a 
            routerLink="/welcome"
            class="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="font-medium">Volver a modo pasajero</span>
          </a>
        </div>

        <!-- Footer -->
        <p class="text-center text-white/70 text-sm mt-8">
          Portal de Conductores v1.0
        </p>
      </div>
    </div>
  `
})
export class DriverWelcomeComponent {}
