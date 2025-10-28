import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { User, RegisterDto, LoginDto } from '../models/user.model';
import { Card } from '../models/card.model';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  user: User;
  token: string;
  card?: Card;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUser = signal<User | null>(null);
  private readonly STORAGE_KEY = 'tci_current_user';
  private readonly TOKEN_KEY = 'tci_token';

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.STORAGE_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
      } catch (error) {
        console.error('Error loading user from storage', error);
      }
    }
  }

  register(userData: RegisterDto): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.currentUser.set(response.user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response.user));
          localStorage.setItem(this.TOKEN_KEY, response.token);
          
          // Guardar tarjeta si viene en la respuesta
          if (response.card) {
            localStorage.setItem('tci_card', JSON.stringify(response.card));
          }
        }),
        map(response => response.user),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en registro:', error);
          return throwError(() => new Error(error.error?.message || 'Error al registrar usuario'));
        })
      );
  }

  login(credentials: LoginDto): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.currentUser.set(response.user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response.user));
          localStorage.setItem(this.TOKEN_KEY, response.token);
          
          // Guardar tarjeta si viene en la respuesta
          if (response.card) {
            localStorage.setItem('tci_card', JSON.stringify(response.card));
          }
        }),
        map(response => response.user),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en login:', error);
          return throwError(() => new Error(error.error?.message || 'Credenciales inválidas'));
        })
      );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null && !!localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now();
  }

  private generateCardNumber(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private generateQRCode(userId: string): string {
    return `TCI-${userId}-${Date.now()}`;
  }
}

