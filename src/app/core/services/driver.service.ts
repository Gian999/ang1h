import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
import { DriverData, DriverLoginData } from '../models/driver.model';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  private currentDriver = signal<DriverData | null>(null);
  private readonly STORAGE_KEY = 'tci_driver';
  private readonly TOKEN_KEY = 'tci_driver_token';

  constructor() {
    this.loadDriverFromStorage();
  }

  private loadDriverFromStorage(): void {
    const driverStr = localStorage.getItem(this.STORAGE_KEY);
    if (driverStr) {
      try {
        const driver = JSON.parse(driverStr);
        this.currentDriver.set(driver);
      } catch (error) {
        console.error('Error loading driver', error);
      }
    }
  }

  sendVerificationCode(identifier: string): Observable<string> {
    // For demo, simulate sending code
    console.log('Demo verification code: 123456');
    return of('••••4321').pipe(delay(1500));
  }

  register(personalData: any, vehicleData: any): Observable<DriverData> {
    const driverData = {
      ...personalData,
      ...vehicleData
    };

    return this.http.post<AuthResponse>(`${environment.apiUrl}/driver/register`, driverData)
      .pipe(
        tap(response => {
          this.currentDriver.set(response.user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response.user));
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }),
        map(response => response.user),
        catchError(error => {
          console.error('Error en registro de conductor:', error);
          return throwError(() => new Error('Error al registrar conductor'));
        })
      );
  }

  login(identifier: string, password: string, code: string): Observable<boolean> {
    // Validate verification code (demo: always 123456)
    if (code !== '123456') {
      return throwError(() => new Error('Código de verificación inválido'));
    }

    // Call backend API
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      identifier,
      password,
      verificationCode: code
    }).pipe(
      tap(response => {
        this.currentDriver.set(response.user);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response.user));
        localStorage.setItem(this.TOKEN_KEY, response.token);
      }),
      map(() => true),
      catchError(error => {
        console.error('Error en login de conductor:', error);
        return throwError(() => new Error('Error al iniciar sesión como conductor'));
      })
    );
  }

  logout(): void {
    this.currentDriver.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.currentDriver() !== null && !!localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentDriver(): DriverData | null {
    return this.currentDriver();
  }

  getDriverSignal() {
    return this.currentDriver;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}