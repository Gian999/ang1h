import { Injectable, signal } from '@angular/core';
import { Observable, Subject, throwError, from } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

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
    // Usar plugin nativo en móvil, browser API en web
    if (Capacitor.isNativePlatform()) {
      return from(this.getCurrentPositionNative());
    }
    
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

  private async getCurrentPositionNative(): Promise<GeolocationPosition> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      const geoPos: GeolocationPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
      
      this.currentPosition.set(geoPos);
      this.error.set(null);
      return geoPos;
    } catch (error: any) {
      const errorMsg = error.message || 'Error al obtener ubicación';
      this.error.set(errorMsg);
      throw errorMsg;
    }
  }

  watchPosition(): Observable<GeolocationPosition> {
    // Usar plugin nativo en móvil
    if (Capacitor.isNativePlatform()) {
      this.watchPositionNative();
      return this.positionSubject.asObservable();
    }

    // Usar browser API en web
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

  private async watchPositionNative(): Promise<void> {
    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        },
        (position, err) => {
          if (err) {
            const errorMsg = err.message || 'Error al obtener ubicación';
            this.error.set(errorMsg);
            this.positionSubject.error(errorMsg);
            return;
          }

          if (position) {
            const geoPos: GeolocationPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            this.currentPosition.set(geoPos);
            this.error.set(null);
            this.positionSubject.next(geoPos);
          }
        }
      );
      
      this.watchId = Number(watchId);
    } catch (error: any) {
      const errorMsg = error.message || 'Error al observar ubicación';
      this.error.set(errorMsg);
      this.positionSubject.error(errorMsg);
    }
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      if (Capacitor.isNativePlatform()) {
        Geolocation.clearWatch({ id: String(this.watchId) });
      } else {
        navigator.geolocation.clearWatch(this.watchId);
      }
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
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Geolocation.checkPermissions();
        if (result.location === 'granted') return 'granted';
        if (result.location === 'denied') return 'denied';
        
        // Solicitar permiso
        const permission = await Geolocation.requestPermissions();
        if (permission.location === 'granted') return 'granted';
        if (permission.location === 'denied') return 'denied';
        return 'prompt';
      } catch (error) {
        console.error('Error checking geolocation permission', error);
        return 'prompt';
      }
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch (error) {
      console.error('Error checking geolocation permission', error);
      return 'prompt';
    }
  }
}
