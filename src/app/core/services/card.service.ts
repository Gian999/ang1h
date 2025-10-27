import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Card, CardRechargeDto } from '../models/card.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private balance = signal<number>(15.50);
  private card = signal<Card | null>(null);
  private readonly CARD_KEY = 'tci_card';

  constructor() {
    this.loadCardFromStorage();
  }

  private loadCardFromStorage(): void {
    const cardStr = localStorage.getItem(this.CARD_KEY);
    if (cardStr) {
      try {
        const card = JSON.parse(cardStr);
        this.card.set(card);
        this.balance.set(card.balance);
      } catch (error) {
        console.error('Error loading card from storage', error);
      }
    }
  }

  getBalance() {
    return this.balance;
  }

  getCard() {
    return this.card;
  }

  recharge(rechargeDto: CardRechargeDto): Observable<Transaction> {
    const currentCard = this.card();
    if (!currentCard) {
      throw new Error('No hay tarjeta activa');
    }

    const transaction: Transaction = {
      id: this.generateId(),
      userId: currentCard.userId,
      cardId: currentCard.id,
      tipo: 'recarga',
      monto: rechargeDto.amount,
      descripcion: `Recarga vía ${this.getMethodName(rechargeDto.method)}`,
      detalles: {
        method: rechargeDto.method,
        codigoRecarga: rechargeDto.method === 'sede' ? this.generateRechargeCode() : undefined
      },
      fecha: new Date(),
      estado: 'exitoso'
    };

    return of(transaction).pipe(
      delay(1500),
      tap(() => {
        const newBalance = this.balance() + rechargeDto.amount;
        this.balance.set(newBalance);
        
        // Actualizar balance en la tarjeta
        const updatedCard = { ...currentCard, balance: newBalance };
        this.card.set(updatedCard);
        localStorage.setItem(this.CARD_KEY, JSON.stringify(updatedCard));
      })
    );
  }

  payFare(adultos: number, escolares: number): Observable<Transaction> {
    const currentCard = this.card();
    if (!currentCard) {
      throw new Error('No hay tarjeta activa');
    }

    const TARIFAS = { ADULTO: 1.00, ESCOLAR: 0.50 };
    const totalAmount = (adultos * TARIFAS.ADULTO) + (escolares * TARIFAS.ESCOLAR);

    if (this.balance() < totalAmount) {
      throw new Error('Saldo insuficiente');
    }

    const transaction: Transaction = {
      id: this.generateId(),
      userId: currentCard.userId,
      cardId: currentCard.id,
      tipo: 'pasaje',
      monto: totalAmount,
      descripcion: `Pago de pasaje - ${adultos + escolares} pasajero(s)`,
      detalles: {
        adultos,
        escolares,
        ruta: 'Ruta General' // Por ahora genérico
      },
      fecha: new Date(),
      estado: 'exitoso'
    };

    return of(transaction).pipe(
      delay(1000),
      tap(() => {
        const newBalance = this.balance() - totalAmount;
        this.balance.set(newBalance);
        
        // Actualizar balance en la tarjeta
        const updatedCard = { ...currentCard, balance: newBalance };
        this.card.set(updatedCard);
        localStorage.setItem(this.CARD_KEY, JSON.stringify(updatedCard));
      })
    );
  }

  private getMethodName(method: string): string {
    const methods: Record<string, string> = {
      'tarjeta': 'Tarjeta de débito/crédito',
      'billetera': 'Billetera digital',
      'sede': 'Sede autorizada'
    };
    return methods[method] || method;
  }

  private generateId(): string {
    return 'txn_' + Math.random().toString(36).substr(2, 9) + Date.now();
  }

  private generateRechargeCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
