import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../../core/services/card.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AmountSelectorComponent } from '../../../shared/components/amount-selector.component';

@Component({
  selector: 'app-recharge',
  standalone: true,
  imports: [CommonModule, FormsModule, AmountSelectorComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <div class="bg-white shadow-sm sticky top-0 z-10">
        <div class="px-4 py-4 flex items-center gap-4">
          <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-gray-900">Recargar saldo</h1>
            <p class="text-sm text-gray-600">Saldo actual: S/ {{ balance().toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div class="p-4 pb-24">
        <!-- Amount Selector -->
        <div class="bg-white rounded-2xl p-6 shadow-md mb-6">
          <app-amount-selector
            [quickAmounts]="[2, 5, 10, 20, 50]"
            [minAmount]="1"
            [maxAmount]="500"
            (amountChange)="onAmountChange($event)"
          ></app-amount-selector>
        </div>

        <!-- Payment Methods -->
        <div class="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 class="font-bold text-gray-900 mb-4">Método de pago</h2>
          
          <div class="space-y-3">
            <label 
              class="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors"
              [class.border-primary]="selectedMethod === 'tarjeta'"
              [class.bg-blue-50]="selectedMethod === 'tarjeta'"
            >
              <input
                type="radio"
                name="method"
                value="tarjeta"
                [(ngModel)]="selectedMethod"
                class="w-5 h-5 text-primary focus:ring-primary"
              />
              <div class="flex-1 flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Tarjeta de débito/crédito</p>
                  <p class="text-xs text-gray-500">Pago seguro en línea</p>
                </div>
              </div>
            </label>

            <label 
              class="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors"
              [class.border-primary]="selectedMethod === 'billetera'"
              [class.bg-blue-50]="selectedMethod === 'billetera'"
            >
              <input
                type="radio"
                name="method"
                value="billetera"
                [(ngModel)]="selectedMethod"
                class="w-5 h-5 text-primary focus:ring-primary"
              />
              <div class="flex-1 flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Billetera digital</p>
                  <p class="text-xs text-gray-500">Yape, Plin y más</p>
                </div>
              </div>
            </label>

            <label 
              class="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors"
              [class.border-primary]="selectedMethod === 'sede'"
              [class.bg-blue-50]="selectedMethod === 'sede'"
            >
              <input
                type="radio"
                name="method"
                value="sede"
                [(ngModel)]="selectedMethod"
                class="w-5 h-5 text-primary focus:ring-primary"
              />
              <div class="flex-1 flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-emphasis" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Sede autorizada</p>
                  <p class="text-xs text-gray-500">Genera código para pagar en persona</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Summary -->
        <div *ngIf="selectedAmount" class="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 class="font-bold text-gray-900 mb-4">Resumen</h2>
          <div class="space-y-3">
            <div class="flex justify-between text-gray-700">
              <span>Monto a recargar</span>
              <span class="font-bold">S/ {{ selectedAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Comisión</span>
              <span class="font-bold">S/ 0.00</span>
            </div>
            <div class="border-t pt-3 flex justify-between text-lg">
              <span class="font-bold text-gray-900">Total</span>
              <span class="font-bold text-primary">S/ {{ selectedAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mb-4 p-4 bg-error/10 border border-error rounded-lg">
          <p class="text-sm text-error">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Fixed Bottom Button -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <button
          (click)="processRecharge()"
          [disabled]="!selectedAmount || !selectedMethod || loading"
          class="w-full py-4 bg-success text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <span *ngIf="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ getButtonText() }}</span>
        </button>
      </div>
    </div>
  `
})
export class RechargeComponent {
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);

  balance = this.cardService.getBalance();
  selectedAmount: number | null = null;
  selectedMethod: 'tarjeta' | 'billetera' | 'sede' | null = null;
  loading = false;
  errorMessage = '';

  onAmountChange(amount: number): void {
    this.selectedAmount = amount;
    this.errorMessage = '';
  }

  getButtonText(): string {
    if (this.loading) return 'Procesando...';
    if (this.selectedMethod === 'sede') return `Generar código`;
    return `Pagar S/ ${this.selectedAmount?.toFixed(2) || '0.00'}`;
  }

  processRecharge(): void {
    if (!this.selectedAmount || !this.selectedMethod) return;

    this.loading = true;
    this.errorMessage = '';

    this.cardService.recharge({ 
      amount: this.selectedAmount, 
      method: this.selectedMethod 
    }).subscribe({
      next: (transaction) => {
        this.loading = false;
        this.transactionService.addTransaction(transaction);
        
        // Show success message
        if (this.selectedMethod === 'sede') {
          alert(`Código de recarga generado: ${transaction.detalles?.codigoRecarga}\n\nPresenta este código en una sede autorizada para completar tu recarga.`);
        } else {
          alert('¡Recarga exitosa!');
        }
        
        this.router.navigate(['/card/my-card']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error al procesar la recarga. Por favor, intenta de nuevo.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/card/my-card']);
  }
}
