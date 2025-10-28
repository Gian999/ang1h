import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Zoom controls -->
    <div class="absolute top-20 right-4 z-10 space-y-2">
      <button
        (click)="zoomIn.emit()"
        class="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
        <span class="text-xl font-bold text-gray-700">+</span>
      </button>
      <button
        (click)="zoomOut.emit()"
        class="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
        <span class="text-xl font-bold text-gray-700">−</span>
      </button>
    </div>

    <!-- Location controls -->
    <div class="absolute bottom-6 right-4 z-10 space-y-2">
      <button
        (click)="toggleFollowMode.emit()"
        [class.bg-primary]="isFollowMode"
        [class.text-white]="isFollowMode"
        [class.bg-white]="!isFollowMode"
        [class.text-gray-700]="!isFollowMode"
        class="w-12 h-12 shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      </button>
      <button
        (click)="centerUser.emit()"
        [disabled]="isLocating"
        class="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        <svg *ngIf="!isLocating" class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <svg *ngIf="isLocating" class="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
    </div>
  `
})
export class MapControlsComponent {
  @Input() isFollowMode = false;
  @Input() isLocating = false;
  @Output() centerUser = new EventEmitter<void>();
  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() toggleFollowMode = new EventEmitter<void>();
}
