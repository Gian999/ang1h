import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span class="text-sm opacity-90">{{ tipo === 'virtual' ? 'Tarjeta Virtual' : 'Tarjeta Física' }}</span>
        </div>
        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>
      
      <div class="mb-6">
        <p class="text-sm opacity-80 mb-1">Saldo disponible</p>
        <p class="text-4xl font-bold">S/ {{ balance.toFixed(2) }}</p>
      </div>
      
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs opacity-70 mb-1">Número de tarjeta</p>
          <p class="text-lg font-mono">•••• {{ cardNumber }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs opacity-70 mb-1">Estado</p>
          <span class="inline-block px-3 py-1 bg-success/30 rounded-full text-xs font-medium">
            Activa
          </span>
        </div>
      </div>
    </div>
  `
})
export class BalanceCardComponent {
  @Input() balance: number = 0;
  @Input() cardNumber: string = '0000';
  @Input() tipo: 'virtual' | 'fisica' = 'virtual';
}
