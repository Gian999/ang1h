import { Injectable } from '@angular/core';
import { BusData } from '../models/bus-data.model';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  /**
   * Parsea el QR del microbus
   * Formato esperado: "BUS:{placa}:{ruta}:{validador}"
   * Ejemplo: "BUS:ABC123:Ruta 5:VALID001"
   */
  parseBusQR(qrData: string): BusData {
    const parts = qrData.split(':');
    
    if (parts[0] !== 'BUS' || parts.length < 4) {
      throw new Error('Formato de QR inválido');
    }
    
    return {
      placa: parts[1],
      ruta: parts[2],
      validador: parts[3]
    };
  }
  
  /**
   * Valida si un QR es de tipo BUS
   */
  isValidBusQR(qrData: string): boolean {
    try {
      this.parseBusQR(qrData);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Genera un QR de bus (para admin/conductor)
   * En producción esto vendría del backend
   */
  generateBusQR(placa: string, ruta: string, validador: string): string {
    return `BUS:${placa}:${ruta}:${validador}`;
  }
}
