import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService, DriverLocationData } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

declare var mapboxgl: any;

interface DriverMarker {
  marker: any;
  popup: any;
  data: DriverLocationData;
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen flex flex-col bg-gray-900">
      <!-- Header -->
      <div class="bg-gradient-to-r from-primary to-blue-600 text-white p-4 shadow-lg">
        <div class="flex items-center gap-4">
          <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl font-bold">Mapa de Buses en Tiempo Real</h1>
            <p class="text-sm opacity-90">{{ connectionStatus }}</p>
          </div>
        </div>
      </div>

      <!-- Mapa Mapbox -->
      <div class="flex-1 relative">
        <div id="map" class="w-full h-full"></div>

        <!-- Selector de Ruta (floating) -->
        <div class="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-4 z-10 min-w-[200px]">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            🚌 Seleccionar Ruta
          </label>
          <select
            [(ngModel)]="selectedRoute"
            (change)="onRouteChange()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium"
          >
            <option value="">Todas las rutas</option>
            <option value="4A">Ruta 4A</option>
            <option value="5B">Ruta 5B</option>
            <option value="7">Ruta 7</option>
            <option value="10">Ruta 10</option>
            <option value="12">Ruta 12</option>
          </select>
          
          <div class="mt-2 flex items-center gap-2 text-xs">
            <div 
              [class.bg-green-400]="isConnected" 
              [class.bg-red-400]="!isConnected"
              [class.animate-pulse]="isConnected"
              class="w-2 h-2 rounded-full"
            ></div>
            <span class="text-gray-600">{{ driversCount }} buses</span>
          </div>
        </div>

        <!-- Botón centrar ubicación -->
        <button
          (click)="centerOnUser()"
          class="absolute bottom-24 right-4 bg-white p-3 rounded-full shadow-2xl z-10 hover:bg-gray-50 transition-all active:scale-95"
          title="Centrar en mi ubicación"
        >
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>

        <!-- Error Toast -->
        <div 
          *ngIf="errorMessage"
          class="absolute top-4 left-4 right-4 bg-error text-white p-4 rounded-lg shadow-lg z-20 flex items-start gap-3"
        >
          <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="font-medium">Error</p>
            <p class="text-sm text-white/90 mt-1">{{ errorMessage }}</p>
          </div>
          <button (click)="errorMessage = ''" class="flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Info Panel -->
        <div class="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-bold text-gray-900">Buses en Tiempo Real</p>
              <p class="text-sm text-gray-600">
                {{ hasUserLocation ? 'Tocá un bus para ver más información' : 'Activa tu ubicación para ver tu posición' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }

    #map {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }

    @keyframes pulse-marker {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8);
      }
      50% {
        box-shadow: 0 0 0 25px rgba(16, 185, 129, 0);
      }
    }

    .pulse-marker {
      animation: pulse-marker 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .pulse-marker:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 25px rgba(0,0,0,0.5) !important;
    }
  `]
})
export class MapViewComponent implements OnInit, OnDestroy {
  private wsService = inject(WebSocketService);
  private router = inject(Router);

  private map: any;
  private userMarker: any;
  private driverMarkers = new Map<string, DriverMarker>();
  private wsSubscription?: Subscription;
  private userWatchId: number | null = null;

  isConnected = false;
  hasUserLocation = false;
  connectionStatus = 'Conectando...';
  errorMessage = '';
  driversCount = 0;
  
  // Selector de ruta
  selectedRoute = ''; // Todas las rutas por defecto
  availableRoutes = ['4A', '5B', '7', '10', '12'];

  // Juliaca coordinates
  private readonly JULIACA_COORDS: [number, number] = [-70.1322, -15.4933];

  ngOnInit(): void {
    this.loadMapboxScript().then(() => {
      this.initializeMap();
      this.connectWebSocket();
      this.requestUserLocation();
    });
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
    this.wsSubscription?.unsubscribe();
    
    if (this.userWatchId !== null) {
      navigator.geolocation.clearWatch(this.userWatchId);
    }
  }

  private loadMapboxScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).mapboxgl) {
        console.log('[MapView] Mapbox GL ya está cargado');
        resolve();
        return;
      }

      console.log('[MapView] Cargando Mapbox GL script...');
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.onload = () => {
        console.log('[MapView] Mapbox GL script cargado');
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        console.log('[MapView] Mapbox GL CSS cargado');
        
        // Esperar un momento para que el CSS se aplique
        setTimeout(() => resolve(), 100);
      };
      script.onerror = (error) => {
        console.error('[MapView] Error cargando Mapbox GL script:', error);
        this.errorMessage = 'Error cargando mapa. Verifica tu conexión.';
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  private initializeMap(): void {
    try {
      const mapboxgl = (window as any).mapboxgl;
      
      if (!mapboxgl) {
        console.error('[MapView] Mapbox GL no está disponible');
        this.errorMessage = 'Error: Mapbox GL no cargado';
        return;
      }

      console.log('[MapView] Inicializando mapa...');
      console.log('[MapView] Token:', environment.mapboxToken.substring(0, 20) + '...');
      console.log('[MapView] Coordenadas:', this.JULIACA_COORDS);

      mapboxgl.accessToken = environment.mapboxToken;

      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: this.JULIACA_COORDS,
        zoom: 14,
        pitch: 45, // Vista 3D inclinada (igual que conductor)
        bearing: 0,
        antialias: true,
        attributionControl: true
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
        console.log('[MapView] ✅ Mapa Mapbox cargado correctamente');
        
        // Add 3D buildings layer (igual que conductor)
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

      this.map.on('error', (e: any) => {
        console.error('[MapView] ❌ Error en Mapbox:', e);
        this.errorMessage = 'Error cargando el mapa: ' + (e.error?.message || 'Desconocido');
      });

      this.map.on('style.load', () => {
        console.log('[MapView] Estilo del mapa cargado');
      });
    } catch (error: any) {
      console.error('[MapView] ❌ Error fatal inicializando mapa:', error);
      this.errorMessage = 'Error inicializando mapa: ' + error.message;
    }
  }

  private connectWebSocket(): void {
    console.log('[MapView] Iniciando conexión WebSocket...');
    this.wsService.connect();

    // Escuchar estado de conexión
    this.wsService.isConnected().subscribe(connected => {
      console.log('[MapView] Estado de conexión WebSocket:', connected);
      this.isConnected = connected;
      this.connectionStatus = connected ? 'Conectado - En vivo' : 'Desconectado';
      
      if (!connected) {
        this.driversCount = 0;
        this.errorMessage = 'Conectando al servidor...';
        
        // Limpiar mensaje de error después de 3 segundos
        setTimeout(() => {
          if (!this.isConnected) {
            this.errorMessage = '';
          }
        }, 3000);
      } else {
        this.errorMessage = '';
        // Suscribirse a la ruta cuando se conecte
        this.subscribeToSelectedRoute();
      }
    });
    
    console.log('[MapView] ✅ Suscripciones WebSocket configuradas');
  }

  onRouteChange(): void {
    console.log('[MapView] Ruta cambiada a:', this.selectedRoute || 'TODAS');
    
    // Limpiar marcadores existentes
    this.driverMarkers.forEach(markerData => {
      markerData.marker.remove();
    });
    this.driverMarkers.clear();
    this.driversCount = 0;
    
    // Cancelar suscripción anterior
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    
    // Suscribirse a la nueva ruta
    this.subscribeToSelectedRoute();
  }

  private subscribeToSelectedRoute(): void {
    if (!this.isConnected) {
      console.log('[MapView] No conectado, esperando conexión...');
      return;
    }

    if (this.selectedRoute) {
      // Suscribirse a ruta específica
      console.log('[MapView] Suscribiéndose a ruta:', this.selectedRoute);
      this.wsSubscription = this.wsService.subscribeToRoute(this.selectedRoute).subscribe(driver => {
        console.log('[MapView] ✅ Ubicación recibida de ruta', this.selectedRoute, ':', driver);
        if (driver) {
          this.updateSingleDriverMarker(driver);
        }
      });
    } else {
      // Ver todas las rutas (endpoint viejo)
      console.log('[MapView] Suscribiéndose a TODAS las rutas');
      this.wsSubscription = this.wsService.onDriversLocations().subscribe(update => {
        console.log('[MapView] Update recibido de todos los conductores:', update);
        if (update && update.drivers) {
          console.log('[MapView] ✅ Actualizando', update.drivers.length, 'buses en el mapa');
          this.driversCount = update.drivers.length;
          this.updateDriverMarkers(update.drivers);
        }
      });
    }
  }

  private updateSingleDriverMarker(driver: DriverLocationData): void {
    const mapboxgl = (window as any).mapboxgl;
    const existing = this.driverMarkers.get(driver.placa);

    if (existing) {
      // Actualizar posición existente con animación suave
      existing.marker.setLngLat([driver.lng, driver.lat]);
      existing.data = driver;
      
      // Actualizar popup
      const popupHTML = this.createDriverPopupHTML(driver);
      existing.popup.setHTML(popupHTML);
    } else {
      // Crear nuevo marcador
      const el = document.createElement('div');
      el.className = 'pulse-marker';
      el.style.width = '50px';
      el.style.height = '50px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#10B981';
      el.style.border = '5px solid white';
      el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.transition = 'all 0.3s ease';
      el.innerHTML = '<div style="font-size:26px;">🚌</div>';

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.5)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
      });

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'driver-popup'
      }).setHTML(this.createDriverPopupHTML(driver));

      const marker = new mapboxgl.Marker({ 
        element: el,
        anchor: 'center',
        rotationAlignment: 'map',
        pitchAlignment: 'map'
      })
        .setLngLat([driver.lng, driver.lat])
        .setPopup(popup)
        .addTo(this.map);

      this.driverMarkers.set(driver.placa, { marker, popup, data: driver });
      this.driversCount = this.driverMarkers.size;
      
      console.log('[MapView] ✅ Marcador creado para bus', driver.placa, '- Total:', this.driversCount);
    }
  }

  private updateDriverMarkers(drivers: DriverLocationData[]): void {
    const mapboxgl = (window as any).mapboxgl;
    const currentPlacas = new Set(drivers.map(d => d.placa));

    // Remover marcadores de conductores que ya no están activos
    this.driverMarkers.forEach((markerData, placa) => {
      if (!currentPlacas.has(placa)) {
        markerData.marker.remove();
        this.driverMarkers.delete(placa);
      }
    });

    // Actualizar o crear marcadores
    drivers.forEach(driver => {
      const existing = this.driverMarkers.get(driver.placa);

      if (existing) {
        // Actualizar posición existente con animación suave
        existing.marker.setLngLat([driver.lng, driver.lat]);
        existing.data = driver;
        
        // Actualizar popup
        const popupHTML = this.createDriverPopupHTML(driver);
        existing.popup.setHTML(popupHTML);
      } else {
        // Crear nuevo marcador con animación (igual que conductor)
        const el = document.createElement('div');
        el.className = 'pulse-marker';
        el.style.width = '50px';
        el.style.height = '50px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#10B981'; // verde para buses activos
        el.style.border = '5px solid white';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s ease';
        el.innerHTML = '<div style="font-size:26px;">🚌</div>';

        // Hover effects
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.5)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        });

        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: false,
          className: 'driver-popup'
        }).setHTML(this.createDriverPopupHTML(driver));

        const marker = new mapboxgl.Marker({ 
          element: el,
          anchor: 'center',
          rotationAlignment: 'map',
          pitchAlignment: 'map'
        })
          .setLngLat([driver.lng, driver.lat])
          .setPopup(popup)
          .addTo(this.map);

        this.driverMarkers.set(driver.placa, { marker, popup, data: driver });
      }
    });
  }

  private createDriverPopupHTML(driver: DriverLocationData): string {
    return `
      <div style="padding:8px;text-align:center;min-width:150px;">
        <div style="font-size:20px;margin-bottom:4px;">🚌</div>
        <strong style="color:#10B981;font-size:14px;">Bus ${driver.placa}</strong><br>
        ${driver.ruta ? `<span style="font-size:12px;color:#666;">Ruta ${driver.ruta}</span><br>` : ''}
        ${driver.driverName ? `<span style="font-size:11px;color:#888;">${driver.driverName}</span><br>` : ''}
        <span style="font-size:11px;color:#059669;font-weight:bold;">
          ${driver.speed ? Math.round(driver.speed * 3.6) + ' km/h' : 'En movimiento'}
        </span>
      </div>
    `;
  }

  private requestUserLocation(): void {
    if (!navigator.geolocation) {
      console.error('[MapView] Geolocalización no disponible en este navegador');
      this.errorMessage = 'Geolocalización no disponible';
      return;
    }

    console.log('[MapView] Solicitando ubicación del usuario...');

    // Obtener ubicación inicial
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('[MapView] ✅ Ubicación obtenida:', { lat: latitude, lng: longitude });
        this.updateUserMarker(longitude, latitude);
        this.hasUserLocation = true;
      },
      (error) => {
        console.error('[MapView] ❌ Error obteniendo ubicación:', error);
        let errorMsg = 'No se pudo obtener tu ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMsg = 'Tiempo de espera agotado';
            break;
        }
        
        this.errorMessage = errorMsg;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Seguir ubicación en tiempo real
    this.userWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('[MapView] Ubicación actualizada:', { lat: latitude, lng: longitude });
        this.updateUserMarker(longitude, latitude);
        this.hasUserLocation = true;
      },
      (error) => {
        console.error('[MapView] Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }

  private updateUserMarker(lng: number, lat: number): void {
    try {
      const mapboxgl = (window as any).mapboxgl;

      if (!this.map) {
        console.error('[MapView] Mapa no inicializado, no se puede agregar marcador');
        return;
      }

      if (!this.userMarker) {
        console.log('[MapView] Creando marcador de usuario en:', { lng, lat });
        
        // Crear marcador del usuario
        const el = document.createElement('div');
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#2563EB';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        this.userMarker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(this.map);
          
        console.log('[MapView] ✅ Marcador de usuario creado');
      } else {
        // Actualizar posición
        this.userMarker.setLngLat([lng, lat]);
      }
    } catch (error) {
      console.error('[MapView] ❌ Error actualizando marcador de usuario:', error);
    }
  }

  centerOnUser(): void {
    if (!this.hasUserLocation) {
      this.errorMessage = 'Activa tu ubicación primero';
      return;
    }

    const lngLat = this.userMarker.getLngLat();
    this.map.flyTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: 15,
      duration: 1000
    });
  }

  goBack(): void {
    this.router.navigate(['/card/my-card']);
  }
}

