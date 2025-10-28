import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CardService } from '../../../core/services/card.service';
import { BalanceCardComponent } from '../../../shared/components/balance-card.component';
import { QrCodeComponent } from '../../../shared/components/qr-code.component';

@Component({
  selector: 'app-my-card',
  standalone: true,
  imports: [CommonModule, RouterLink, BalanceCardComponent, QrCodeComponent],
  template: `
    <div class="min-h-screen bg-background pb-20">
      <!-- Header -->
      <div class="bg-primary text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
              {{ getInitials() }}
            </div>
            <div>
              <p class="text-sm opacity-80">Hola,</p>
              <h1 class="text-xl font-bold">{{ getUserName() }}</h1>
            </div>
          </div>
          <button (click)="showMenu = !showMenu" class="w-10 h-10 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Menu Dropdown -->
        <div *ngIf="showMenu" class="absolute right-4 top-20 bg-white rounded-lg shadow-xl p-2 z-50 min-w-[200px]">
          <a routerLink="/profile" class="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Ver perfil
          </a>
          <button (click)="logout()" class="w-full text-left px-4 py-3 text-error hover:bg-error/10 rounded-lg flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div class="px-4 -mt-4">
        <!-- Balance Card -->
        <div class="mb-6">
          <app-balance-card
            [balance]="balance()"
            [cardNumber]="cardNumber()"
            [tipo]="cardType()"
          ></app-balance-card>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <a 
            routerLink="/card/recharge"
            class="bg-success text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-green-700 transition-colors shadow-md"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="font-bold">Recargar</span>
          </a>

          <a 
            routerLink="/card/scan-qr"
            class="bg-primary text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span class="font-bold">Escanear QR</span>
          </a>
        </div>

        <!-- QR Card -->
        <div class="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4 text-center">Tu código QR personal</h2>
          <app-qr-code
            [value]="qrCode()"
            [size]="250"
            [label]="'Muestra este código al validador'"
          ></app-qr-code>
          <p class="text-xs text-gray-500 text-center mt-4">
            Este código te identifica de forma única en el sistema
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl p-4 shadow-md">
          <h3 class="font-bold text-gray-900 mb-3">Acciones rápidas</h3>
          <div class="space-y-2">
            <a 
              routerLink="/card/movements"
              class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Ver movimientos</p>
                  <p class="text-xs text-gray-500">Historial de transacciones</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <a 
              routerLink="/map"
              class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Ver mapa</p>
                  <p class="text-xs text-gray-500">Ubicación y rutas</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <button 
              class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-emphasis" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Vincular tarjeta física</p>
                  <p class="text-xs text-gray-500">Escanea el QR de tu tarjeta</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyCardComponent implements OnInit {
  private authService = inject(AuthService);
  private cardService = inject(CardService);
  private router = inject(Router);

  showMenu = false;
  balance = this.cardService.getBalance();
  card = this.cardService.getCard();

  ngOnInit(): void {
    // Ensure card is loaded
    if (!this.card()) {
      this.cardService.getCard();
    }
  }

  cardNumber(): string {
    return this.card()?.numero || '0000';
  }

  cardType(): 'virtual' | 'fisica' {
    return this.card()?.tipo || 'virtual';
  }

  qrCode(): string {
    return this.card()?.qrCode || 'TCI-DEFAULT';
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser()();
    return user?.nombres || 'Usuario';
  }

  getInitials(): string {
    const user = this.authService.getCurrentUser()();
    if (user) {
      const firstInitial = user.nombres.charAt(0).toUpperCase();
      const lastInitial = user.apellidos.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    }
    return 'U';
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}
