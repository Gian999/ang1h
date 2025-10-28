import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private transactions = signal<Transaction[]>([]);
  private readonly STORAGE_KEY = 'tci_transactions';

  constructor() {
    this.loadTransactionsFromStorage();
  }

  private loadTransactionsFromStorage(): void {
    const txnsStr = localStorage.getItem(this.STORAGE_KEY);
    if (txnsStr) {
      try {
        const txns = JSON.parse(txnsStr);
        this.transactions.set(txns);
      } catch (error) {
        console.error('Error loading transactions', error);
      }
    }
  }

  getTransactions() {
    return this.transactions;
  }

  /**
   * Cargar transacciones del usuario desde el backend
   */
  loadUserTransactions(userId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions/user/${userId}`)
      .pipe(
        tap(transactions => {
          this.transactions.set(transactions);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error cargando transacciones:', error);
          return of(this.transactions()); // Retornar cache local en caso de error
        })
      );
  }

  /**
   * Crear nueva transacción
   */
  createTransaction(transaction: Omit<Transaction, 'id' | 'fecha'>): Observable<Transaction> {
    return this.http.post<Transaction>(`${environment.apiUrl}/transactions`, transaction)
      .pipe(
        tap(newTransaction => {
          const current = this.transactions();
          const updated = [newTransaction, ...current];
          this.transactions.set(updated);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error creando transacción:', error);
          return throwError(() => new Error(error.error?.message || 'Error al crear transacción'));
        })
      );
  }

  /**
   * Agregar transacción localmente (fallback o demo)
   */
  addTransaction(transaction: Transaction): void {
    const current = this.transactions();
    const updated = [transaction, ...current];
    this.transactions.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  filterByDate(filter: 'all' | 'today' | '7days' | '30days'): Transaction[] {
    const now = new Date();
    const allTxns = this.transactions();

    switch (filter) {
      case 'today':
        return allTxns.filter(txn => this.isToday(new Date(txn.fecha)));
      case '7days':
        return allTxns.filter(txn => this.isDaysAgo(new Date(txn.fecha), 7));
      case '30days':
        return allTxns.filter(txn => this.isDaysAgo(new Date(txn.fecha), 30));
      default:
        return allTxns;
    }
  }

  filterByType(tipo: 'all' | 'recarga' | 'pasaje' | 'vinculacion'): Transaction[] {
    if (tipo === 'all') {
      return this.transactions();
    }
    return this.transactions().filter(txn => txn.tipo === tipo);
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private isDaysAgo(date: Date, days: number): boolean {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    return daysDiff <= days;
  }
}

