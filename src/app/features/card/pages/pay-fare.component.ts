import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardService } from '../../../core/services/card.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { NumericStepperComponent } from '../../../shared/components/numeric-stepper.component';
import { QrCodeComponent } from '../../../shared/components/qr-code.component';
import { TARIFAS } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-pay-fare',
  standalone: true,
  imports: [CommonModule, NumericStepperComponent, QrCodeComponent],
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
            <h1 class="text-xl font-bold text-gray-900">Pagar pasaje</h1>
            <p class="text-sm text-gray-600">Saldo: S/ {{ balance().toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div class="p-4 pb-24">
        <!-- Multipago Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg class="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-medium text-primary">Multipago activado</p>
            <p class="text-sm text-blue-700 mt-1">Puedes pagar por varias personas en una sola operación</p>
          </div>
        </div>

        <!-- Passenger Selection -->
        <div class="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 class="font-bold text-gray-900 mb-6">Selecciona los pasajeros</h2>
          
          <div class="space-y-6">
            <!-- Adultos -->
            <app-numeric-stepper
              [(value)]="adultos"
              (valueChange)="calculateTotal()"
              [min]="0"
              [max]="10"
              [label]="'Adultos'"
              [pricePerUnit]="TARIFAS.ADULTO"
              [showTotal]="true"
            ></app-numeric-stepper>

            <!-- Escolares -->
            <app-numeric-stepper
              [(value)]="escolares"
              (valueChange)="calculateTotal()"
              [min]="0"
              [max]="10"
              [label]="'Escolares'"
              [pricePerUnit]="TARIFAS.ESCOLAR"
              [showTotal]="true"
            ></app-numeric-stepper>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 class="font-bold text-gray-900 mb-4">Resumen</h2>
          <div class="space-y-3">
            <div class="flex justify-between text-gray-700">
              <span>Total de pasajeros</span>
              <span class="font-bold">{{ totalPassengers }}</span>
            </div>
            <div class="border-t pt-3 flex justify-between text-lg">
              <span class="font-bold text-gray-900">Total a pagar</span>
              <span class="font-bold text-primary">S/ {{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Insufficient Balance Warning -->
          <div *ngIf="totalAmount > balance()" class="mt-4 p-3 bg-error/10 border border-error rounded-lg">
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-medium text-error">Saldo insuficiente</p>
                <p class="text-sm text-error/80 mt-1">
                  Necesitas S/ {{ (totalAmount - balance()).toFixed(2) }} más para realizar esta transacción
                </p>
              </div>
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
          (click)="generateQR()"
          [disabled]="totalPassengers === 0 || totalAmount > balance() || loading"
          class="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span>Generar QR de pago</span>
        </button>
      </div>
    </div>

    <!-- QR Modal -->
    <div *ngIf="showQRModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" (click)="closeModal()">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Código de pago</h2>
          <button (click)="closeModal()" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <app-qr-code
          [value]="paymentQRCode"
          [size]="250"
          [label]="'Muestra este código al cobrador'"
        ></app-qr-code>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-700 space-y-2">
            <div class="flex justify-between">
              <span>Adultos:</span>
              <span class="font-medium">{{ adultos }} x S/ {{ TARIFAS.ADULTO.toFixed(2) }}</span>
            </div>
            <div *ngIf="escolares > 0" class="flex justify-between">
              <span>Escolares:</span>
              <span class="font-medium">{{ escolares }} x S/ {{ TARIFAS.ESCOLAR.toFixed(2) }}</span>
            </div>
            <div class="border-t pt-2 flex justify-between font-bold text-primary">
              <span>Total:</span>
              <span>S/ {{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Demo Button -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs text-blue-700 mb-3">
            <strong>Modo demo:</strong> Simula el pago sin necesidad de un validador
          </p>
          <button
            (click)="simulatePayment()"
            [disabled]="loading"
            class="w-full py-3 bg-success text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {{ loading ? 'Procesando...' : 'Simular pago exitoso' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class PayFareComponent {
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);

  balance = this.cardService.getBalance();
  TARIFAS = TARIFAS;
  
  adultos = 1;
  escolares = 0;
  totalAmount = TARIFAS.ADULTO;
  showQRModal = false;
  paymentQRCode = '';
  loading = false;
  errorMessage = '';

  get totalPassengers(): number {
    return this.adultos + this.escolares;
  }

  calculateTotal(): void {
    this.totalAmount = (this.adultos * TARIFAS.ADULTO) + (this.escolares * TARIFAS.ESCOLAR);
  }

  generateQR(): void {
    if (this.totalPassengers === 0) {
      this.errorMessage = 'Debes seleccionar al menos un pasajero';
      return;
    }

    if (this.totalAmount > this.balance()) {
      this.errorMessage = 'Saldo insuficiente';
      return;
    }

    this.paymentQRCode = `TCI-PAYMENT-${Date.now()}-A${this.adultos}-E${this.escolares}-${this.totalAmount}`;
    this.showQRModal = true;
    this.errorMessage = '';
  }

  simulatePayment(): void {
    this.loading = true;
    this.errorMessage = '';

    this.cardService.payFare(this.adultos, this.escolares).subscribe({
      next: (transaction) => {
        this.loading = false;
        this.transactionService.addTransaction(transaction);
        this.showQRModal = false;
        alert('¡Pago exitoso!');
        this.router.navigate(['/card/my-card']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error al procesar el pago';
      }
    });
  }

  closeModal(): void {
    this.showQRModal = false;
  }

  goBack(): void {
    this.router.navigate(['/card/my-card']);
  }
}
