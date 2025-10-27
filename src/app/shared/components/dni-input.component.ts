import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-dni-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-4">
      <label [for]="inputId" class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-error">*</span>
      </label>
      <input
        [id]="inputId"
        type="text"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [placeholder]="placeholder"
        [maxlength]="8"
        [disabled]="disabled"
        class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base"
        [class.border-error]="showError"
        [class.border-success]="isValid && value.length === 8"
      />
      <div *ngIf="showError" class="mt-1 text-sm text-error">
        {{ errorMessage }}
      </div>
      <div *ngIf="!showError && value.length > 0 && value.length < 8" class="mt-1 text-sm text-gray-500">
        {{ 8 - value.length }} dígito(s) restantes
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DniInputComponent),
      multi: true
    }
  ]
})
export class DniInputComponent implements ControlValueAccessor {
  @Input() label = 'DNI';
  @Input() placeholder = '12345678';
  @Input() required = false;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  value = '';
  inputId = `dni-input-${Math.random().toString(36).substr(2, 9)}`;
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get isValid(): boolean {
    return this.value.length === 8 && /^\d{8}$/.test(this.value);
  }

  get showError(): boolean {
    return this.value.length > 0 && this.value.length === 8 && !this.isValid;
  }

  get errorMessage(): string {
    if (!/^\d+$/.test(this.value)) {
      return 'El DNI solo debe contener números';
    }
    return 'El DNI debe tener exactamente 8 dígitos';
  }

  onValueChange(newValue: string): void {
    // Solo permitir números
    this.value = newValue.replace(/\D/g, '').substring(0, 8);
    this.valueChange.emit(this.value);
    this.onChange(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
