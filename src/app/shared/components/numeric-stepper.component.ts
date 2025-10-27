import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-numeric-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      <div *ngIf="label" class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">{{ label }}</label>
        <span *ngIf="pricePerUnit" class="text-sm text-gray-500">{{ priceLabel }}</span>
      </div>
      
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="decrement()"
          [disabled]="value <= min"
          class="w-11 h-11 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        
        <div class="flex-1 text-center">
          <div class="text-2xl font-bold text-gray-900">{{ value }}</div>
          <div *ngIf="showTotal && pricePerUnit" class="text-sm text-gray-600 mt-1">
            S/ {{ (value * pricePerUnit).toFixed(2) }}
          </div>
        </div>
        
        <button
          type="button"
          (click)="increment()"
          [disabled]="value >= max"
          class="w-11 h-11 rounded-lg bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  `
})
export class NumericStepperComponent {
  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 10;
  @Input() label: string = '';
  @Input() pricePerUnit?: number;
  @Input() showTotal: boolean = true;
  @Output() valueChange = new EventEmitter<number>();

  get priceLabel(): string {
    return this.pricePerUnit ? `S/ ${this.pricePerUnit.toFixed(2)} por persona` : '';
  }

  increment(): void {
    if (this.value < this.max) {
      this.value++;
      this.valueChange.emit(this.value);
    }
  }

  decrement(): void {
    if (this.value > this.min) {
      this.value--;
      this.valueChange.emit(this.value);
    }
  }
}
