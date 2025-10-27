import { Injectable, signal } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private currentPosition = signal<GeolocationPosition | null>(null);
  private error = signal<string | null>(null);
  private watchId: number | null = null;
  private positionSubject = new Subject<GeolocationPosition>();

  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocalización no soportada en este navegador');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoPos: GeolocationPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          this.currentPosition.set(geoPos);
          this.error.set(null);
          observer.next(geoPos);
          observer.complete();
        },
        (error) => {
          const errorMsg = this.getErrorMessage(error);
          this.error.set(errorMsg);
          observer.error(errorMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  watchPosition(): Observable<GeolocationPosition> {
    if (!navigator.geolocation) {
      return throwError(() => 'Geolocalización no soportada en este navegador');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const geoPos: GeolocationPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        this.currentPosition.set(geoPos);
        this.error.set(null);
        this.positionSubject.next(geoPos);
      },
      (error) => {
        const errorMsg = this.getErrorMessage(error);
        this.error.set(errorMsg);
        this.positionSubject.error(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    return this.positionSubject.asObservable();
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getPosition() {
    return this.currentPosition;
  }

  getError() {
    return this.error;
  }

  private getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación en la configuración de tu navegador.';
      case error.POSITION_UNAVAILABLE:
        return 'Información de ubicación no disponible.';
      case error.TIMEOUT:
        return 'La solicitud de ubicación ha excedido el tiempo de espera.';
      default:
        return 'Error desconocido al obtener la ubicación.';
    }
  }

  async requestPermission(): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch (error) {
      console.error('Error checking geolocation permission', error);
      return 'prompt';
    }
  }
}
