import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <!-- Logo/Icon -->
        <div class="text-center mb-8">
          <div class="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <svg class="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">
            Transporte Colectivo Inteligente
          </h1>
          <p class="text-blue-100 text-lg">Juliaca</p>
        </div>

        <!-- Description -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-white">
          <p class="text-center text-lg mb-6">
            Viaja de forma rápida, segura y sin efectivo
          </p>
          
          <!-- Features -->
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <p class="text-sm font-medium">Pago con QR</p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-sm font-medium">100% Digital</p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="text-sm font-medium">Multipago</p>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="space-y-3">
          <a 
            routerLink="/auth/register"
            class="block w-full py-4 bg-white text-primary rounded-xl font-bold text-center text-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            Crear cuenta
          </a>
          
          <a 
            routerLink="/auth/login"
            class="block w-full py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-center text-lg hover:bg-white/10 transition-colors"
          >
            Iniciar sesión
          </a>
        </div>

        <!-- Link to driver portal -->
        <div class="mt-6">
          <a 
            routerLink="/driver"
            class="flex items-center justify-center gap-2 text-white/90 hover:text-white transition-colors group"
          >
            <svg class="w-5 h-5 text-emphasis" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span class="font-medium">Acceso para conductores</span>
            <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <!-- Footer -->
        <p class="text-center text-white/70 text-sm mt-8">
          Versión 1.0 - Juliaca, Perú
        </p>
      </div>
    </div>
  `
})
export class WelcomeComponent {}
