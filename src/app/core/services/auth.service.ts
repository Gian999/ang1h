import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, RegisterDto, LoginDto } from '../models/user.model';
import { Card } from '../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private readonly STORAGE_KEY = 'tci_current_user';

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
    // Simulación de registro
    const newUser: User = {
      id: this.generateId(),
      dni: userData.dni,
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      fechaNacimiento: userData.fechaNacimiento,
      email: userData.email,
      celular: userData.celular,
      distrito: userData.distrito,
      createdAt: new Date()
    };

    return of(newUser).pipe(
      delay(1000),
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        
        // Crear tarjeta virtual automáticamente
        const card: Card = {
          id: this.generateId(),
          userId: user.id,
          numero: this.generateCardNumber(),
          tipo: 'virtual',
          qrCode: this.generateQRCode(user.id),
          balance: 15.50, // Saldo inicial demo
          activa: true,
          createdAt: new Date()
        };
        localStorage.setItem('tci_card', JSON.stringify(card));
      })
    );
  }

  login(credentials: LoginDto): Observable<User> {
    // Simulación de login - Demo credentials: DNI: 12345678, Password: demo123
    if ((credentials.identifier === '12345678' || credentials.identifier === 'demo@example.com') 
        && credentials.password === 'demo123') {
      const demoUser: User = {
        id: 'demo-user-id',
        dni: '12345678',
        nombres: 'Juan Carlos',
        apellidos: 'Mamani Quispe',
        fechaNacimiento: new Date('1990-01-15'),
        email: 'demo@example.com',
        celular: '987654321',
        distrito: 'Juliaca',
        createdAt: new Date()
      };

      return of(demoUser).pipe(
        delay(800),
        tap(user => {
          this.currentUser.set(user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          
          // Asegurar que existe una tarjeta demo
          if (!localStorage.getItem('tci_card')) {
            const card: Card = {
              id: 'demo-card-id',
              userId: user.id,
              numero: '5678',
              tipo: 'virtual',
              qrCode: this.generateQRCode(user.id),
              balance: 15.50,
              activa: true,
              createdAt: new Date()
            };
            localStorage.setItem('tci_card', JSON.stringify(card));
          }
        })
      );
    }

    return throwError(() => new Error('Credenciales inválidas'));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUser() {
    return this.currentUser;
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
