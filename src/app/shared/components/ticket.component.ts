import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header con borde punteado -->
        <div class="relative">
          <div class="bg-gradient-to-r from-primary to-blue-700 text-white p-6 text-center">
            <div
              [class.text-green-400]="type === 'recarga'"
              [class.text-blue-400]="type === 'pago'"
              class="mb-3">
              <svg *ngIf="type === 'recarga'" class="mx-auto w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" stroke-width="2"></polyline>
              </svg>
              <svg *ngIf="type === 'pago'" class="mx-auto w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold mb-1">{{ type === 'recarga' ? '¡Recarga exitosa!' : '¡Pago exitoso!' }}</h2>
            <p class="text-4xl font-bold mt-2">S/ {{ amount.toFixed(2) }}</p>
          </div>
          <!-- Borde punteado -->
          <div class="h-6 bg-background relative">
            <div class="absolute top-0 left-0 right-0 h-3 bg-white" style="
              background-image: radial-gradient(circle at 10px 0, transparent 10px, white 10px);
              background-size: 20px 20px;
              background-position: 0 0;
            "></div>
          </div>
        </div>

        <!-- Details -->
        <div class="p-6 space-y-3">
          <div *ngFor="let item of items" class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">{{ item.label }}</span>
            <span class="font-medium text-gray-900">{{ item.value }}</span>
          </div>
          
          <div class="pt-3">
            <p class="text-xs text-gray-400 text-center">ID: {{ transactionId }}</p>
            <p class="text-xs text-gray-400 text-center">{{ formatDate(date) }}</p>
          </div>
        </div>

        <!-- Action Button -->
        <div class="p-6 pt-0">
          <button
            (click)="goBack()"
            class="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  `
})
export class TicketComponent {
  @Input() type: 'recarga' | 'pago' = 'recarga';
  @Input() amount = 0;
  @Input() items: { label: string; value: string }[] = [];
  @Input() transactionId = '';
  @Input() date = new Date();

  constructor(private router: Router) {}

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/card/my-card']);
  }
}
