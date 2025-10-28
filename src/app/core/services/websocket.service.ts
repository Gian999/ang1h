import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';

export enum SocketEvents {
  // Pasajeros
  PASSENGER_PAYMENT = 'passenger:payment',
  PASSENGER_LOCATION = 'passenger:location',
  
  // Conductores
  DRIVER_CONNECT = 'driver:connect',
  DRIVER_DUTY_STATUS = 'driver:duty_status',
  DRIVER_LOCATION = 'driver:location',
  
  // Broadcast
  PASSENGER_BOARDED = 'passenger:boarded',
  BUS_LOCATION_UPDATE = 'bus:location_update'
}

export interface PassengerBoardedEvent {
  adultos: number;
  escolares: number;
  total: number;
  timestamp: number;
  totalPassengers: number;
  totalCollected: number;
}

export interface PaymentData {
  busPlaca: string;
  adultos: number;
  escolares: number;
  total: number;
  passengerId: string;
}

export interface DriverConnectData {
  placa: string;
  ruta: string;
  driverName: string;
}

export interface DriverLocationData {
  placa: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: number;
  ruta?: string;
  driverName?: string;
}

export interface DriversMapUpdate {
  drivers: DriverLocationData[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient?: Client;
  private connected$ = new BehaviorSubject<boolean>(false);
  private passengerBoarded$ = new BehaviorSubject<PassengerBoardedEvent | null>(null);
  private driversLocations$ = new BehaviorSubject<DriversMapUpdate | null>(null);
  private subscriptions: StompSubscription[] = [];
  private locationInterval?: number;

  // Destinos STOMP
  private readonly DESTINATIONS = {
    // Enviar mensajes (app)
    PASSENGER_PAYMENT: '/app/passenger/payment',
    DRIVER_CONNECT: '/app/driver/connect',
    DRIVER_LOCATION: '/app/driver/location',
    
    // Suscripciones (topic)
    PASSENGER_BOARDED: '/topic/passenger/boarded',
    BUS_LOCATION_UPDATE: '/topic/bus/location',
    DRIVERS_MAP: '/topic/drivers', // Para ver TODOS los conductores (sin filtro)
    ROUTE_PREFIX: '/topic/route/', // Para suscribirse a una ruta específica: /topic/route/4A
    DRIVER_SPECIFIC: '/topic/driver/' // + placa, para mensajes a conductor específico
  };

  constructor() {}

  /**
   * Conectar al servidor WebSocket con STOMP
   */
  connect(): void {
    if (this.stompClient?.connected) {
      console.log('[WebSocket] Ya está conectado');
      this.connected$.next(true);
      return;
    }

    console.log('[WebSocket] Iniciando conexión a:', environment.wsUrl);
    console.log('[WebSocket] Protocolo: STOMP sobre SockJS');
    console.log('[WebSocket] NOTA: SockJS requiere HTTP/HTTPS, NO WS/WSS');

    try {
      this.stompClient = new Client({
        webSocketFactory: () => {
          console.log('[WebSocket] Creando conexión SockJS a:', environment.wsUrl);
          // IMPORTANTE: SockJS requiere http:// o https://, NO ws:// o wss://
          // SockJS maneja automáticamente la conexión WebSocket internamente
          const socket = new SockJS(environment.wsUrl);
          // Forzar que no envíe credenciales
          (socket as any).withCredentials = false;
          return socket;
        },
        connectHeaders: {},
        debug: (str) => {
          console.log('[STOMP Debug]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      this.stompClient.onConnect = (frame) => {
        console.log('[WebSocket] ✅ Conectado al servidor STOMP');
        console.log('[WebSocket] Frame:', frame);
        this.connected$.next(true);
        
        // Suscribirse al topic de pasajeros abordados
        console.log('[WebSocket] Suscribiéndose a:', this.DESTINATIONS.PASSENGER_BOARDED);
        const sub1 = this.stompClient!.subscribe(
          this.DESTINATIONS.PASSENGER_BOARDED,
          (message) => {
            const event: PassengerBoardedEvent = JSON.parse(message.body);
            console.log('[WebSocket] Pasajero abordado recibido:', event);
            this.passengerBoarded$.next(event);
          }
        );
        this.subscriptions.push(sub1);

        // Suscribirse al topic de ubicaciones de conductores (para pasajeros)
        console.log('[WebSocket] Suscribiéndose a:', this.DESTINATIONS.DRIVERS_MAP);
        const sub2 = this.stompClient!.subscribe(
          this.DESTINATIONS.DRIVERS_MAP,
          (message) => {
            const update: DriversMapUpdate = JSON.parse(message.body);
            console.log('[WebSocket] ✅ Ubicaciones de conductores recibidas:', update.drivers.length, 'buses');
            this.driversLocations$.next(update);
          }
        );
        this.subscriptions.push(sub2);
        
        console.log('[WebSocket] ✅ Todas las suscripciones activas');
      };

      this.stompClient.onStompError = (frame) => {
        console.error('[WebSocket] ❌ Error STOMP:', frame.headers['message']);
        console.error('[WebSocket] Detalles del error:', frame.body);
        console.error('[WebSocket] Headers completos:', frame.headers);
        this.connected$.next(false);
      };

      this.stompClient.onWebSocketError = (event) => {
        console.error('[WebSocket] ❌ Error de conexión WebSocket:', event);
        this.connected$.next(false);
      };

      this.stompClient.onDisconnect = () => {
        console.log('[WebSocket] 🔌 Desconectado del servidor');
        this.connected$.next(false);
      };

      this.stompClient.onWebSocketClose = (event) => {
        console.log('[WebSocket] 🔌 WebSocket cerrado:', event);
        this.connected$.next(false);
      };

      console.log('[WebSocket] Activando cliente STOMP...');
      this.stompClient.activate();
    } catch (error) {
      console.error('[WebSocket] ❌ Error fatal al iniciar conexión:', error);
      this.connected$.next(false);
    }
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    // Detener envío de ubicación
    this.stopSendingLocation();
    
    // Cancelar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
    }
    
    this.connected$.next(false);
  }

  /**
   * Registrar conductor
   */
  driverConnect(data: DriverConnectData): void {
    if (!this.stompClient?.connected) {
      console.error('[WebSocket] No conectado - no se puede registrar conductor');
      return;
    }

    this.stompClient.publish({
      destination: this.DESTINATIONS.DRIVER_CONNECT,
      body: JSON.stringify(data)
    });
    
    console.log('[WebSocket] Conductor registrado:', data);
  }

  /**
   * Enviar pago de pasajero
   */
  sendPayment(data: PaymentData): void {
    if (!this.stompClient?.connected) {
      console.error('[WebSocket] No conectado - intentando conectar...');
      this.connect();
      // Reintentar después de conectar
      setTimeout(() => this.sendPayment(data), 1000);
      return;
    }

    this.stompClient.publish({
      destination: this.DESTINATIONS.PASSENGER_PAYMENT,
      body: JSON.stringify({
        ...data,
        timestamp: Date.now()
      })
    });
    
    console.log('[WebSocket] Pago enviado:', data);
  }

  /**
   * Enviar ubicación del conductor
   */
  sendDriverLocation(data: {
    placa: string;
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    numeroRuta?: string; // Agregado: número de ruta
  }): void {
    if (!this.stompClient?.connected) {
      return;
    }

    this.stompClient.publish({
      destination: this.DESTINATIONS.DRIVER_LOCATION,
      body: JSON.stringify({
        ...data,
        timestamp: Date.now()
      })
    });
  }

  /**
   * Observable: Estado de conexión
   */
  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  /**
   * Observable: Pasajero abordado
   */
  onPassengerBoarded(): Observable<PassengerBoardedEvent | null> {
    return this.passengerBoarded$.asObservable();
  }

  /**
   * Observable: Actualización de ubicación de bus
   */
  onBusLocationUpdate(): Observable<any> {
    return new Observable(observer => {
      if (!this.stompClient?.connected) {
        observer.complete();
        return;
      }

      const sub = this.stompClient.subscribe(
        this.DESTINATIONS.BUS_LOCATION_UPDATE,
        (message) => {
          const data = JSON.parse(message.body);
          observer.next(data);
        }
      );

      this.subscriptions.push(sub);

      // Cleanup
      return () => {
        sub.unsubscribe();
        const index = this.subscriptions.indexOf(sub);
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }
      };
    });
  }

  /**
   * Observable: Ubicaciones de conductores en tiempo real (para pasajeros)
   */
  onDriversLocations(): Observable<DriversMapUpdate | null> {
    return this.driversLocations$.asObservable();
  }

  /**
   * Iniciar envío automático de ubicación GPS (solo para conductores)
   * @param placa - Placa del vehículo
   * @param numeroRuta - Número de ruta del conductor
   * @param getCurrentLocation - Función que retorna la ubicación actual
   * @param intervalMs - Intervalo de envío en milisegundos (default: 5000ms)
   */
  startSendingLocation(
    placa: string,
    numeroRuta: string,
    getCurrentLocation: () => { lat: number; lng: number; speed?: number; heading?: number } | null,
    intervalMs: number = 5000
  ): void {
    // Detener envío anterior si existe
    this.stopSendingLocation();

    console.log(`[WebSocket] Iniciando envío de ubicación cada ${intervalMs}ms para ${placa} (Ruta: ${numeroRuta})`);

    this.locationInterval = window.setInterval(() => {
      const location = getCurrentLocation();
      if (location && this.stompClient?.connected) {
        this.sendDriverLocation({
          placa,
          numeroRuta,
          lat: location.lat,
          lng: location.lng,
          speed: location.speed || 0,
          heading: location.heading || 0
        });
      }
    }, intervalMs);
  }

  /**
   * Detener envío automático de ubicación GPS
   */
  stopSendingLocation(): void {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = undefined;
      console.log('[WebSocket] Envío de ubicación detenido');
    }
  }

  /**
   * Suscribirse a mensajes para un conductor específico
   * @param placa - Placa del vehículo
   */
  subscribeToDriverMessages(placa: string): Observable<any> {
    return new Observable(observer => {
      if (!this.stompClient?.connected) {
        console.error('[WebSocket] No conectado - no se puede suscribir a mensajes del conductor');
        observer.complete();
        return;
      }

      const destination = `${this.DESTINATIONS.DRIVER_SPECIFIC}${placa}`;
      const sub = this.stompClient.subscribe(destination, (message) => {
        const data = JSON.parse(message.body);
        console.log(`[WebSocket] Mensaje recibido para conductor ${placa}:`, data);
        observer.next(data);
      });

      this.subscriptions.push(sub);

      // Cleanup
      return () => {
        sub.unsubscribe();
        const index = this.subscriptions.indexOf(sub);
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }
      };
    });
  }

  /**
   * Suscribirse a buses de una ruta específica (NUEVO - FILTRADO POR RUTA)
   * @param numeroRuta - Número de ruta (ej: '4A', '5', etc.)
   * @returns Observable con las actualizaciones de ubicación de buses de esa ruta
   */
  subscribeToRoute(numeroRuta: string): Observable<DriverLocationData> {
    return new Observable(observer => {
      if (!this.stompClient?.connected) {
        console.error('[WebSocket] No conectado - no se puede suscribir a ruta');
        observer.complete();
        return;
      }

      const destination = `${this.DESTINATIONS.ROUTE_PREFIX}${numeroRuta}`;
      console.log(`[WebSocket] Suscribiéndose a ruta: ${numeroRuta} (${destination})`);
      
      const sub = this.stompClient.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log(`[WebSocket] Ubicación recibida de ruta ${numeroRuta}:`, data);
          observer.next(data.payload || data);
        } catch (error) {
          console.error('[WebSocket] Error parseando mensaje de ruta:', error);
        }
      });

      this.subscriptions.push(sub);

      // Cleanup
      return () => {
        console.log(`[WebSocket] Desuscribiéndose de ruta: ${numeroRuta}`);
        sub.unsubscribe();
        const index = this.subscriptions.indexOf(sub);
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }
      };
    });
  }
}


