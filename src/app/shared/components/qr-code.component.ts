import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center">
      <div *ngIf="label" class="mb-3 text-center">
        <p class="text-sm text-gray-600">{{ label }}</p>
      </div>
      
      <div class="bg-white p-4 rounded-xl shadow-md">
        <img 
          [src]="qrCodeUrl" 
          [alt]="'QR Code: ' + value"
          [width]="size"
          [height]="size"
          class="rounded"
        />
      </div>
      
      <div *ngIf="showValue" class="mt-3 px-4 py-2 bg-gray-100 rounded-lg">
        <p class="text-xs font-mono text-gray-700">{{ value }}</p>
      </div>
    </div>
  `
})
export class QrCodeComponent {
  @Input() value: string = '';
  @Input() size: number = 200;
  @Input() label: string = '';
  @Input() showValue: boolean = false;

  get qrCodeUrl(): string {
    const encodedValue = encodeURIComponent(this.value || 'TCI-DEFAULT');
    return `https://api.qrserver.com/v1/create-qr-code/?size=${this.size}x${this.size}&data=${encodedValue}`;
  }
}
