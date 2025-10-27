import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { Transaction } from '../../../core/models/transaction.model';
import { TransactionListComponent } from '../../../shared/components/transaction-list.component';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, TransactionListComponent],
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
          <h1 class="text-xl font-bold text-gray-900">Historial de movimientos</h1>
        </div>

        <!-- Time Filter Tabs -->
        <div class="px-4 pb-3 flex gap-2 overflow-x-auto">
          <button
            *ngFor="let filter of timeFilters"
            (click)="selectedTimeFilter = filter.value; applyFilters()"
            [class.bg-primary]="selectedTimeFilter === filter.value"
            [class.text-white]="selectedTimeFilter === filter.value"
            [class.bg-gray-100]="selectedTimeFilter !== filter.value"
            [class.text-gray-700]="selectedTimeFilter !== filter.value"
            class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div class="p-4">
        <!-- Type Filter Chips -->
        <div class="flex gap-2 overflow-x-auto mb-4 pb-2">
          <button
            *ngFor="let filter of typeFilters"
            (click)="selectedTypeFilter = filter.value; applyFilters()"
            [class.bg-success]="filter.value === 'recarga' && selectedTypeFilter === filter.value"
            [class.bg-primary]="filter.value === 'pasaje' && selectedTypeFilter === filter.value"
            [class.bg-emphasis]="filter.value === 'vinculacion' && selectedTypeFilter === filter.value"
            [class.bg-gray-700]="filter.value === 'all' && selectedTypeFilter === filter.value"
            [class.text-white]="selectedTypeFilter === filter.value"
            [class.bg-gray-100]="selectedTypeFilter !== filter.value"
            [class.text-gray-700]="selectedTypeFilter !== filter.value"
            class="px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors"
          >
            {{ filter.label }}
          </button>
        </div>

        <!-- Transaction List -->
        <app-transaction-list [transactions]="filteredTransactions"></app-transaction-list>
      </div>
    </div>
  `
})
export class MovementsComponent {
  private transactionService = inject(TransactionService);
  private router = inject(Router);

  allTransactions = this.transactionService.getTransactions();
  filteredTransactions: Transaction[] = [];
  
  selectedTimeFilter: 'all' | 'today' | '7days' | '30days' = 'all';
  selectedTypeFilter: 'all' | 'recarga' | 'pasaje' | 'vinculacion' = 'all';

  timeFilters = [
    { label: 'Todos', value: 'all' as const },
    { label: 'Hoy', value: 'today' as const },
    { label: '7 días', value: '7days' as const },
    { label: '30 días', value: '30days' as const }
  ];

  typeFilters = [
    { label: 'Todos', value: 'all' as const },
    { label: 'Recargas', value: 'recarga' as const },
    { label: 'Pasajes', value: 'pasaje' as const },
    { label: 'Vinculaciones', value: 'vinculacion' as const }
  ];

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    let transactions = this.allTransactions();

    // Apply time filter
    if (this.selectedTimeFilter !== 'all') {
      transactions = this.transactionService.filterByDate(this.selectedTimeFilter);
    }

    // Apply type filter
    if (this.selectedTypeFilter !== 'all') {
      transactions = transactions.filter(txn => txn.tipo === this.selectedTypeFilter);
    }

    this.filteredTransactions = transactions;
  }

  goBack(): void {
    this.router.navigate(['/card/my-card']);
  }
}
