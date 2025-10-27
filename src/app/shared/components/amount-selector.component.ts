import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-amount-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Selecciona el monto
      </label>
      
      <div class="grid grid-cols-3 gap-3">
        <button
          *ngFor="let amount of quickAmounts"
          type="button"
          (click)="selectAmount(amount)"
          [class.bg-primary]="selectedAmount === amount && !customMode"
          [class.text-white]="selectedAmount === amount && !customMode"
          [class.bg-white]="selectedAmount !== amount || customMode"
          [class.text-gray-700]="selectedAmount !== amount || customMode"
          class="py-3 px-4 border-2 rounded-lg font-medium transition-all hover:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
          [class.border-primary]="selectedAmount === amount && !customMode"
          [class.border-gray-300]="selectedAmount !== amount || customMode"
        >
          S/ {{ amount }}
        </button>
      </div>
      
      <div class="pt-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Otro monto
        </label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            S/
          </span>
          <input
            type="number"
            [(ngModel)]="customAmount"
            (focus)="onCustomFocus()"
            (ngModelChange)="onCustomChange($event)"
            [min]="minAmount"
            [max]="maxAmount"
            step="0.50"
            placeholder="0.00"
            class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base"
          />
        </div>
        <p class="mt-2 text-xs text-gray-500">
          Monto mínimo: S/ {{ minAmount.toFixed(2) }}
          <span *ngIf="maxAmount"> - Máximo: S/ {{ maxAmount.toFixed(2) }}</span>
        </p>
      </div>
    </div>
  `
})
export class AmountSelectorComponent {
  @Input() quickAmounts: number[] = [2, 5, 10, 20, 50];
  @Input() minAmount: number = 1;
  @Input() maxAmount: number = 500;
  @Output() amountChange = new EventEmitter<number>();

  selectedAmount: number | null = null;
  customAmount: number | null = null;
  customMode: boolean = false;

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.customMode = false;
    this.customAmount = null;
    this.amountChange.emit(amount);
  }

  onCustomFocus(): void {
    this.customMode = true;
    this.selectedAmount = null;
  }

  onCustomChange(value: number | null): void {
    if (value && value >= this.minAmount && value <= this.maxAmount) {
      this.customMode = true;
      this.selectedAmount = null;
      this.amountChange.emit(value);
    }
  }
}
