import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BusService } from '../../../core/services/bus.service';

@Component({
  selector: 'app-scan-qr',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background pb-6">
      <!-- Header -->
      <div class="bg-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <div class="flex items-center gap-3">
          <button 
            (click)="goBack()"
            class="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-semibold">Escanear QR</h1>
            <p class="text-sm text-blue-100">Código del microbus</p>
          </div>
        </div>
      </div>

      <div class="p-4 space-y-6">
        <!-- Área de escaneo -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="aspect-square bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden">
            @if (!isScanning()) {
              <!-- Estado inicial -->
              <div class="text-center space-y-4">
                <div class="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                  </svg>
                </div>
                <p class="text-gray-600 font-medium">Apunta al QR del microbus</p>
              </div>
            } @else {
              <!-- Estado escaneando -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-full h-full border-4 border-primary rounded-xl animate-pulse"></div>
                <div class="absolute text-center space-y-3">
                  <div class="w-16 h-16 mx-auto">
                    <svg class="w-full h-full text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p class="text-primary font-semibold">Escaneando...</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Información -->
        <div class="bg-blue-50 rounded-xl p-4 space-y-3">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div>
              <p class="font-semibold text-gray-900 mb-2">¿Dónde encontrar el QR?</p>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• En la entrada del microbus</li>
                <li>• En el validador del cobrador</li>
                <li>• Cerca de la puerta principal</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Botón demo -->
        <button
          (click)="simulateScan()"
          [disabled]="isScanning()"
          class="w-full bg-gradient-to-r from-primary to-blue-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span>Simular escaneo (Demo)</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse-border {
      0%, 100% {
        border-color: #2563EB;
        opacity: 1;
      }
      50% {
        border-color: #60A5FA;
        opacity: 0.5;
      }
    }
  `]
})
export class ScanQRComponent {
  isScanning = signal<boolean>(false);

  constructor(
    private router: Router,
    private busService: BusService
  ) {}

  onScanSuccess(qrData: string) {
    try {
      const busData = this.busService.parseBusQR(qrData);
      
      this.router.navigate(['/card/pay-fare'], {
        queryParams: {
          placa: busData.placa,
          ruta: busData.ruta,
          validador: busData.validador
        }
      });
    } catch (error) {
      console.error('QR inválido:', error);
      alert('QR inválido. Intenta de nuevo.');
      this.isScanning.set(false);
    }
  }

  simulateScan() {
    this.isScanning.set(true);
    
    setTimeout(() => {
      // Datos demo del microbus
      this.onScanSuccess('BUS:ABC123:Ruta 5:VALID001');
    }, 1500);
  }

  goBack() {
    this.router.navigate(['/card/my-card']);
  }
}
