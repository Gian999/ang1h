import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DriverService } from '../../../../core/services/driver.service';
import { WebSocketService } from '../../../../core/services/websocket.service';

declare var mapboxgl: any;

@Component({
  selector: 'app-driver-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen flex flex-col bg-gray-900">
      <!-- Header -->
      <div class="bg-gradient-to-r from-emphasis to-orange-600 text-white p-4 shadow-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            </svg>
            <div>
              <h1 class="text-lg font-bold">{{ driverName() }}</h1>
              <p class="text-xs opacity-90">Ruta {{ driverRoute() }} • {{ driverPlate() }}</p>
            </div>
          </div>

          <button
            (click)="logout()"
            class="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mapa Mapbox -->
      <div class="flex-1 relative">
        <div id="map" class="w-full h-full"></div>

        <!-- Switch "En servicio" (floating) -->
        <div class="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-4 z-10">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-gray-700">En servicio</span>
            <button
              (click)="toggleService()"
              [class.bg-green-500]="isInService()"
              [class.bg-gray-300]="!isInService()"
              class="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emphasis focus:ring-offset-2"
            >
              <span
                [class.translate-x-8]="isInService()"
                [class.translate-x-1]="!isInService()"
                class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md"
              ></span>
            </button>
          </div>
          
          <div *ngIf="isInService()" class="mt-2 flex items-center gap-2 text-xs text-green-600">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="font-medium">GPS activo</span>
          </div>
          <div *ngIf="!isInService()" class="mt-2 text-xs text-gray-500">
            GPS inactivo
          </div>
        </div>

        <!-- Botón centrar ubicación (floating) -->
        <button
          *ngIf="isInService() && showStats()"
          (click)="centerOnLocation()"
          class="absolute bottom-40 right-4 bg-white p-3 rounded-full shadow-2xl z-10 hover:bg-gray-50 transition-all active:scale-95"
          title="Centrar en mi ubicación"
        >
          <svg class="w-6 h-6 text-emphasis" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>

        <!-- Tarjeta de estadísticas (auto-hide) -->
        <div 
          *ngIf="isInService()"
          class="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl p-5 z-10 transition-all duration-500 ease-in-out"
          [class.opacity-100]="showStats()"
          [class.opacity-0]="!showStats()"
          [class.translate-y-0]="showStats()"
          [class.translate-y-full]="!showStats()"
          [class.pointer-events-none]="!showStats()"
          (click)="keepStatsVisible()"
        >
          <!-- Header del card -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">Ruta en curso</h3>
            <span class="px-3 py-1 bg-emphasis/20 text-emphasis rounded-full text-sm font-bold">
              Ruta {{ driverRoute() }}
            </span>
          </div>

          <!-- Card informativo azul -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <span class="text-2xl">🗺️</span>
            <p class="text-sm text-blue-800 font-medium">Sigue la ruta marcada en el mapa</p>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <!-- Pasajeros -->
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2 transition-transform hover:scale-110">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div class="text-2xl font-bold text-gray-800 tabular-nums">{{ passengerCount() }}</div>
              <div class="text-xs text-gray-500">Pasajeros</div>
            </div>

            <!-- Recaudado -->
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2 transition-transform hover:scale-110">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="text-2xl font-bold text-gray-800 tabular-nums">S/ {{ totalEarnings().toFixed(2) }}</div>
              <div class="text-xs text-gray-500">Recaudado</div>
            </div>

            <!-- Velocidad -->
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2 transition-transform hover:scale-110">
                <svg class="w-6 h-6 text-emphasis" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div class="text-2xl font-bold text-gray-800 tabular-nums">{{ currentSpeed() }}</div>
              <div class="text-xs text-gray-500">km/h</div>
            </div>
          </div>

          <!-- Distancia recorrida -->
          <div *ngIf="tripDistance() > 0" class="mt-3 pt-3 border-t border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            </svg>
            <span>{{ tripDistance().toFixed(2) }} km recorridos</span>
          </div>

          <!-- Botón de demo para simular escaneo -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <button
              (click)="simulateScan(); $event.stopPropagation()"
              class="w-full px-4 py-2 bg-emphasis text-white rounded-lg hover:bg-orange-600 transition-all hover:shadow-lg active:scale-95 text-sm font-medium"
            >
              🎭 Demo: Simular escaneo QR (+1 pasajero)
            </button>
          </div>

          <!-- Indicador de tap para mantener visible -->
          <div class="mt-2 text-center text-xs text-gray-400">
            Toca la tarjeta para mantenerla visible
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no está en servicio -->
      <div *ngIf="!isInService()" class="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none">
        <div class="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 pointer-events-auto">
          <div class="inline-block bg-gray-100 p-4 rounded-full mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Fuera de servicio</h3>
          <p class="text-gray-600 text-sm mb-4">Active el switch "En servicio" para comenzar a rastrear su ubicación y aceptar pasajeros.</p>
          
          <!-- Info de la ruta asignada -->
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-emphasis mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800 mb-1">Ruta asignada: {{ driverRoute() }}</p>
                <p class="text-xs text-gray-600">Los pasajeros se registrarán automáticamente cuando el validador escanee sus códigos QR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes pulse-marker {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.8);
      }
      50% {
        box-shadow: 0 0 0 25px rgba(245, 158, 11, 0);
      }
    }

    .pulse-marker {
      animation: pulse-marker 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .pulse-marker:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 25px rgba(0,0,0,0.5) !important;
    }

    /* Custom scrollbar for stats card */
    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: #F59E0B;
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #d97706;
    }
  `]
})
export class DriverMapComponent implements OnInit, OnDestroy {
  driverName = signal('Conductor');
  driverRoute = signal('');
  driverPlate = signal('');
  
  isInService = signal(false);
  showStats = signal(true);
  
  passengerCount = signal(0);
  totalEarnings = signal(0);
  currentSpeed = signal(0);
  tripDistance = signal(0); // km recorridos

  private map: any;
  private marker: any;
  private watchId: number | null = null;
  private statsHideTimer: any;
  private lastPosition: { lat: number; lng: number } | null = null;
  private readonly FARE_PRICE = 1.50; // Precio del pasaje
  
  // OSRM Route (preparado para v2)
  private routeLayer: any = null;

  constructor(
    private driverService: DriverService,
    private wsService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load driver data
    const driverUser = this.driverService.getCurrentDriver();
    if (driverUser && driverUser.driver) {
      const driver = driverUser.driver;
      this.driverName.set(`${driverUser.nombres} ${driverUser.apellidos}`);
      this.driverRoute.set(driver.numeroRuta || '4A');
      this.driverPlate.set(driver.placa);
      
      // Connect to WebSocket and register driver
      this.wsService.connect();
      this.wsService.driverConnect({
        placa: driver.placa,
        ruta: driver.numeroRuta || '4A',
        driverName: `${driverUser.nombres} ${driverUser.apellidos}`
      });
      
      // Listen for passenger payments
      this.wsService.onPassengerBoarded().subscribe(event => {
        if (event) {
          console.log('Pasajero abordado:', event);
          this.passengerCount.set(event.totalPassengers);
          this.totalEarnings.set(event.totalCollected);
          
          // Auto-expand stats panel when passenger boards
          if (!this.showStats() && this.isInService()) {
            this.showStats.set(true);
            this.showToast('¡Nuevo pasajero abordado!', 'success');
          }
        }
      });
    }

    // Load Mapbox script
    this.loadMapboxScript().then(() => {
      this.initializeMap();
    });
  }

  ngOnDestroy() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.statsHideTimer) {
      clearTimeout(this.statsHideTimer);
    }
    // Disconnect WebSocket
    this.wsService.disconnect();
  }

  private loadMapboxScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).mapboxgl) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  private initializeMap() {
    const mapboxgl = (window as any).mapboxgl;
    mapboxgl.accessToken = 'pk.eyJ1IjoibHVjay1wYXN0b3IiLCJhIjoiY21oOXhjczdsMDBkZjJybjFpam9oMG1qbCJ9.0Q8otsUabn_2ZQVouvfiJw';

    // Center on Juliaca, Peru
    const juliacaCenter: [number, number] = [-70.1322, -15.4933];

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: juliacaCenter,
      zoom: 14,
      pitch: 45, // Vista 3D inclinada
      bearing: 0,
      antialias: true
    });

    // Add navigation controls (zoom buttons)
    this.map.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true
    }), 'bottom-right');

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    this.map.addControl(geolocate, 'bottom-right');

    // Wait for map to load before adding 3D buildings
    this.map.on('load', () => {
      // Add 3D buildings layer
      const layers = this.map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
      )?.id;

      this.map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    // Create custom marker for bus with better styling
    const el = document.createElement('div');
    el.className = 'pulse-marker';
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#F59E0B';
    el.style.border = '5px solid white';
    el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.transition = 'all 0.3s ease';
    el.innerHTML = '<div style="font-size:26px;transform:rotate(0deg);transition:transform 0.5s ease;" id="busIcon">🚐</div>';

    this.marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center',
      rotationAlignment: 'map',
      pitchAlignment: 'map'
    })
      .setLngLat(juliacaCenter)
      .addTo(this.map);

    // Add popup to marker
    const popup = new mapboxgl.Popup({ 
      offset: 25, 
      closeButton: false,
      className: 'bus-popup'
    })
      .setHTML(`
        <div style="padding:8px;text-align:center;">
          <strong style="color:#F59E0B;">Mi Ubicación</strong><br>
          <span style="font-size:12px;color:#666;">Ruta ${this.driverRoute()}</span><br>
          <span id="speedLabel" style="font-size:11px;color:#059669;font-weight:bold;display:none;"></span>
        </div>
      `);
    this.marker.setPopup(popup);

    // Show popup initially
    popup.addTo(this.map);

    // Hide stats on map interaction
    this.map.on('movestart', () => this.startStatsHideTimer());
    this.map.on('click', () => this.startStatsHideTimer());
    this.map.on('touchstart', () => this.startStatsHideTimer());
  }

  private startStatsHideTimer() {
    this.showStats.set(true);
    
    if (this.statsHideTimer) {
      clearTimeout(this.statsHideTimer);
    }

    this.statsHideTimer = setTimeout(() => {
      if (this.isInService()) {
        this.showStats.set(false);
      }
    }, 4000); // 4 segundos según especificación
  }

  keepStatsVisible() {
    // Cancel hide timer and keep stats visible
    if (this.statsHideTimer) {
      clearTimeout(this.statsHideTimer);
    }
    this.showStats.set(true);
    
    // Restart timer after 10 seconds when tapped
    this.statsHideTimer = setTimeout(() => {
      if (this.isInService()) {
        this.showStats.set(false);
      }
    }, 10000);
  }

  toggleService() {
    const newState = !this.isInService();
    this.isInService.set(newState);

    if (newState) {
      this.startGPSTracking();
      this.showStats.set(true);
      
      // Iniciar envío automático de ubicación por WebSocket cada 5 segundos
      const driverUser = this.driverService.getCurrentDriver();
      if (driverUser && driverUser.driver) {
        const driver = driverUser.driver;
        this.wsService.startSendingLocation(
          driver.placa,
          driver.numeroRuta || '4A', // Número de ruta del conductor
          () => this.lastPosition ? {
            lat: this.lastPosition.lat,
            lng: this.lastPosition.lng,
            speed: this.currentSpeed(),
            heading: 0
          } : null,
          5000 // cada 5 segundos
        );
      }
      
      // Toast de activación
      this.showToast('¡En servicio! Tracking GPS iniciado', 'success');
    } else {
      this.stopGPSTracking();
      this.showStats.set(true);
      
      // Detener envío de ubicación por WebSocket
      this.wsService.stopSendingLocation();
      
      // Resetear contadores
      this.passengerCount.set(0);
      this.totalEarnings.set(0);
      this.currentSpeed.set(0);
      this.tripDistance.set(0);
      
      // Toast de desactivación
      this.showToast('Fuera de servicio. Tracking detenido', 'info');
    }
  }

  private showToast(message: string, type: 'success' | 'info' | 'error') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `fixed top-24 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl z-[100] transform transition-all duration-300`;
    toast.style.animation = 'slideDown 0.3s ease-out';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private startGPSTracking() {
    if (!navigator.geolocation) {
      alert('Geolocalización no disponible en este dispositivo');
      this.isInService.set(false);
      return;
    }

    // First, get current position immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.updatePosition(latitude, longitude, null);
      },
      (error) => {
        console.error('GPS Error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Then start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        this.updatePosition(latitude, longitude, speed, heading);
      },
      (error) => {
        console.error('GPS Error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          alert('⚠️ Permiso de ubicación denegado.\n\nPor favor habilite los permisos de ubicación para usar el tracking GPS.');
          this.isInService.set(false);
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert('⚠️ Ubicación no disponible.\n\nVerifique que el GPS esté activado.');
        } else {
          alert('⚠️ Error al obtener ubicación GPS.');
        }
        this.isInService.set(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  private updatePosition(lat: number, lng: number, speed: number | null, heading?: number | null) {
    // Calculate bearing if we have previous position
    let bearing = heading || 0;
    if (this.lastPosition && !heading) {
      bearing = this.calculateBearing(
        this.lastPosition.lat,
        this.lastPosition.lng,
        lat,
        lng
      );
    }

    // Calculate distance traveled (if we have previous position)
    if (this.lastPosition) {
      const distance = this.calculateDistance(
        this.lastPosition.lat,
        this.lastPosition.lng,
        lat,
        lng
      );
      this.tripDistance.set(this.tripDistance() + distance);
    }

    // Update marker position with smooth animation
    this.marker.setLngLat([lng, lat]);

    // Rotate bus icon based on heading
    const busIcon = document.getElementById('busIcon');
    if (busIcon && bearing !== null) {
      busIcon.style.transform = `rotate(${bearing}deg)`;
    }

    // Center map on new position with smooth animation
    this.map.easeTo({
      center: [lng, lat],
      duration: 1000,
      bearing: bearing,
      essential: true
    });

    // Update speed (convert m/s to km/h)
    if (speed !== null && speed > 0) {
      const kmh = Math.round(speed * 3.6);
      this.currentSpeed.set(kmh);
      
      // Update speed label in popup
      const speedLabel = document.getElementById('speedLabel');
      if (speedLabel) {
        speedLabel.textContent = `${kmh} km/h`;
        speedLabel.style.display = 'block';
      }
    } else {
      this.currentSpeed.set(0);
      
      // Hide speed label
      const speedLabel = document.getElementById('speedLabel');
      if (speedLabel) {
        speedLabel.style.display = 'none';
      }
    }

    // Save last position
    this.lastPosition = { lat, lng };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula to calculate distance in kilometers
    const R = 6371; // Earth radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRadians = (deg: number) => deg * (Math.PI / 180);
    const toDegrees = (rad: number) => rad * (180 / Math.PI);

    const dLng = toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
              Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);
    
    let bearing = toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;
    
    return bearing;
  }

  centerOnLocation() {
    if (this.lastPosition) {
      this.map.flyTo({
        center: [this.lastPosition.lng, this.lastPosition.lat],
        zoom: 16,
        duration: 1500,
        essential: true
      });
      
      // Show stats briefly
      this.keepStatsVisible();
    }
  }

  // ==========================================
  // OSRM ROUTE OPTIMIZATION (Preparado para v2)
  // ==========================================
  /*
   * Esta función está preparada para integración futura con OSRM.
   * En v2, se descomentará y se conectará con el servicio OSRM real.
   * 
   * OSRM (Open Source Routing Machine) permite:
   * - Calcular rutas optimizadas entre puntos
   * - Obtener direcciones turn-by-turn
   * - Estimar tiempos de llegada
   * - Optimizar rutas con múltiples paradas
   */
  
  /*
  private async fetchOSRMRoute(start: [number, number], end: [number, number]) {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Dibujar ruta en el mapa
        this.drawRouteOnMap(route.geometry);
        
        // Información de la ruta
        const distance = (route.distance / 1000).toFixed(2); // km
        const duration = Math.round(route.duration / 60); // minutos
        
        console.log(`Ruta calculada: ${distance} km, ~${duration} min`);
        
        return route;
      }
    } catch (error) {
      console.error('Error al obtener ruta OSRM:', error);
    }
  }

  private drawRouteOnMap(geometry: any) {
    // Remover ruta anterior si existe
    if (this.routeLayer && this.map.getLayer('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }

    // Agregar nueva ruta
    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: geometry
      }
    });

    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#F59E0B', // Color ámbar
        'line-width': 6,
        'line-opacity': 0.8
      }
    });

    this.routeLayer = true;
  }

  // Ejemplo de uso (comentado para v1):
  // ngOnInit() {
  //   ...
  //   const routeStart: [number, number] = [-70.1322, -15.4933]; // Terminal
  //   const routeEnd: [number, number] = [-70.1500, -15.5000]; // Destino
  //   this.fetchOSRMRoute(routeStart, routeEnd);
  // }
  */

  private stopGPSTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.currentSpeed.set(0);
  }

  simulateScan() {
    // Simulate QR scan - increment passenger count
    const newCount = this.passengerCount() + 1;
    this.passengerCount.set(newCount);
    
    // Update earnings
    this.totalEarnings.set(newCount * this.FARE_PRICE);

    // Show stats and keep visible longer
    this.showStats.set(true);
    this.keepStatsVisible();

    // Visual feedback with better animation
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] transform transition-all duration-300';
    notification.style.animation = 'slideDown 0.5s ease-out';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="bg-white/20 p-2 rounded-full">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div>
          <p class="font-bold text-lg">¡Pasaje registrado!</p>
          <p class="text-sm text-white/90">+S/ ${this.FARE_PRICE.toFixed(2)} • Total: ${newCount} pasajeros</p>
        </div>
      </div>
    `;
    
    // Add slide animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translate(-50%, -20px);
        }
        to {
          opacity: 1;
          transform: translate(-50%, 0);
        }
      }
      @keyframes slideUp {
        from {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        to {
          opacity: 0;
          transform: translate(-50%, -20px);
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Add sound effect simulation (vibration if available)
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.5s ease-in';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 500);
    }, 3000);
  }

  logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      this.driverService.logout();
      this.router.navigate(['/driver']);
    }
  }
}
