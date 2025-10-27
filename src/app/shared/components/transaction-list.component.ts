import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <div *ngIf="transactions.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500 text-sm">No hay movimientos para mostrar</p>
      </div>
      
      <div *ngFor="let transaction of transactions" 
           class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div 
              [class.bg-success]="transaction.tipo === 'recarga'"
              [class.bg-primary]="transaction.tipo === 'pasaje'"
              [class.bg-emphasis]="transaction.tipo === 'vinculacion'"
              class="w-11 h-11 rounded-full flex items-center justify-center text-white"
            >
              <svg *ngIf="transaction.tipo === 'recarga'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <svg *ngIf="transaction.tipo === 'pasaje'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <svg *ngIf="transaction.tipo === 'vinculacion'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">
                  {{ getTitle(transaction) }}
                </h4>
                <p class="text-sm text-gray-600 mt-1">
                  {{ transaction.descripcion }}
                </p>
                <div *ngIf="transaction.detalles?.ruta" class="mt-1">
                  <span class="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                    {{ transaction.detalles?.ruta }}
                  </span>
                </div>
              </div>
              
              <div class="text-right flex-shrink-0">
                <p 
                  [class.text-success]="transaction.tipo === 'recarga'"
                  [class.text-gray-900]="transaction.tipo !== 'recarga'"
                  class="font-bold text-lg"
                >
                  {{ transaction.tipo === 'recarga' ? '+' : '-' }} S/ {{ transaction.monto.toFixed(2) }}
                </p>
              </div>
            </div>
            
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-gray-500">
                {{ formatDate(transaction.fecha) }}
              </p>
              <span 
                [class.bg-success]="transaction.estado === 'exitoso'"
                [class.bg-emphasis]="transaction.estado === 'pendiente'"
                [class.bg-error]="transaction.estado === 'fallido'"
                class="px-2 py-1 rounded-full text-xs text-white font-medium"
              >
                {{ transaction.estado }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransactionListComponent {
  @Input() transactions: Transaction[] = [];

  getTitle(transaction: Transaction): string {
    const titles: Record<string, string> = {
      'recarga': 'Recarga de saldo',
      'pasaje': 'Pago de pasaje',
      'vinculacion': 'Vinculación de tarjeta'
    };
    return titles[transaction.tipo] || transaction.tipo;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return d.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
