import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CardService } from '../../../core/services/card.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { NumericStepperComponent } from '../../../shared/components/numeric-stepper.component';
import { TARIFAS } from '../../../core/models/transaction.model';
import { BusData } from '../../../core/models/bus-data.model';

@Component({
  selector: 'app-pay-fare',
  standalone: true,
  imports: [CommonModule, NumericStepperComponent],
  template: `
    <div class="min-h-screen bg-background">
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
        <div class="bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold">{{ busData().placa }}</h2>
              <p class="text-blue-100 text-sm">Microbus escaneado</p>
            </div>
            <div class="bg-emphasis text-white px-3 py-1 rounded-full text-sm font-bold">
              {{ busData().ruta }}
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-blue-100">Validador: {{ busData().validador }}</span>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg class="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-medium text-primary">Multipago activado</p>
            <p class="text-sm text-blue-700 mt-1">Puedes pagar por varias personas en una sola operación</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 class="font-bold text-gray-900 mb-6">Selecciona los pasajeros</h2>
          <div class="space-y-6">
            <app-numeric-stepper [(value)]="adultos" (valueChange)="calculateTotal()" [min]="0" [max]="10" [label]="'Adultos'" [pricePerUnit]="TARIFAS.ADULTO" [showTotal]="true"></app-numeric-stepper>
            <app-numeric-stepper [(value)]="escolares" (valueChange)="calculateTotal()" [min]="0" [max]="10" [label]="'Escolares'" [pricePerUnit]="TARIFAS.ESCOLAR" [showTotal]="true"></app-numeric-stepper>
          </div>
        </div>

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
          @if (totalAmount > balance()) {
            <div class="mt-4 p-3 bg-error/10 border border-error rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="font-medium text-error">Saldo insuficiente</p>
                  <p class="text-sm text-error/80 mt-1">Necesitas S/ {{ (totalAmount - balance()).toFixed(2) }} más para realizar esta transacción</p>
                </div>
              </div>
            </div>
          }
        </div>

        @if (errorMessage()) {
          <div class="mb-4 p-4 bg-error/10 border border-error rounded-lg">
            <p class="text-sm text-error">{{ errorMessage() }}</p>
          </div>
        }
      </div>

      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <button (click)="processPayment()" [disabled]="totalPassengers === 0 || totalAmount > balance() || loading()" class="w-full py-4 bg-success text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span>{{ loading() ? 'Procesando...' : 'Pagar S/ ' + totalAmount.toFixed(2) }}</span>
        </button>
      </div>
    </div>
  `
})
export class PayFareComponent implements OnInit {
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  balance = this.cardService.getBalance();
  TARIFAS = TARIFAS;
  busData = signal<BusData>({ placa: '', ruta: '', validador: '' });
  
  adultos = 1;
  escolares = 0;
  totalAmount = TARIFAS.ADULTO;
  loading = signal(false);
  errorMessage = signal('');

  get totalPassengers(): number {
    return this.adultos + this.escolares;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const placa = params['placa'] || '';
      const ruta = params['ruta'] || '';
      const validador = params['validador'] || '';
      if (!placa || !ruta || !validador) {
        this.errorMessage.set('Datos del bus incompletos. Por favor, escanea el código QR nuevamente.');
        this.router.navigate(['/card/scan-qr']);
        return;
      }
      this.busData.set({ placa, ruta, validador });
    });
  }

  calculateTotal(): void {
    this.totalAmount = (this.adultos * TARIFAS.ADULTO) + (this.escolares * TARIFAS.ESCOLAR);
  }

  processPayment(): void {
    if (this.totalPassengers === 0) {
      this.errorMessage.set('Debes seleccionar al menos un pasajero');
      return;
    }
    if (this.totalAmount > this.balance()) {
      this.errorMessage.set('Saldo insuficiente');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.cardService.payFare(this.adultos, this.escolares).subscribe({
      next: (transaction) => {
        const enrichedTransaction = {
          ...transaction,
          busPlaca: this.busData().placa,
          validador: this.busData().validador
        };
        this.transactionService.addTransaction(enrichedTransaction);
        
        // Enviar evento WebSocket al conductor
        const currentUser = this.authService.getCurrentUser();
        this.wsService.sendPayment({
          busPlaca: this.busData().placa,
          adultos: this.adultos,
          escolares: this.escolares,
          total: this.totalAmount,
          passengerId: currentUser()?.dni || ''
        });
        
        this.loading.set(false);
        alert(`Pago exitoso!
Bus: `+this.busData().placa+`
Ruta: `+this.busData().ruta+`
Total: S/ `+this.totalAmount.toFixed(2));
        this.router.navigate(['/card/my-card']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message || 'Error al procesar el pago');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/card/my-card']);
  }
}
