import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { GeolocationService } from '../../../core/services/geolocation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-screen">
      <!-- Header -->
      <div class="absolute top-0 left-0 right-0 bg-white shadow-md z-10">
        <div class="px-4 py-4 flex items-center gap-4">
          <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-gray-900">Mapa</h1>
            <p class="text-sm text-gray-600">{{ locationStatus }}</p>
          </div>
        </div>
      </div>

      <!-- Map Container -->
      <div #mapContainer class="w-full h-full"></div>

      <!-- Geolocation Button -->
      <button
        (click)="centerOnUser()"
        [disabled]="isLoadingLocation"
        class="absolute bottom-24 right-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 z-10 transition-colors"
        [class.animate-pulse]="isLoadingLocation"
      >
        <svg 
          class="w-7 h-7"
          [class.text-primary]="hasLocation"
          [class.text-gray-500]="!hasLocation"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <!-- Error Toast -->
      <div 
        *ngIf="errorMessage"
        class="absolute top-20 left-4 right-4 bg-error text-white p-4 rounded-lg shadow-lg z-20 flex items-start gap-3"
      >
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="font-medium">Error de ubicación</p>
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
            <p class="font-bold text-gray-900">Vista de Juliaca</p>
            <p class="text-sm text-gray-600">
              {{ hasLocation ? 'Tu ubicación está marcada en el mapa' : 'Activa tu ubicación para ver tu posición' }}
            </p>
          </div>
        </div>

        <!-- Future Features (Commented in code) -->
        <!--
        <div class="mt-3 pt-3 border-t text-xs text-gray-500">
          <p>Próximamente:</p>
          <ul class="list-disc list-inside mt-1 space-y-1">
            <li>Buses en tiempo real</li>
            <li>Paradas cercanas</li>
            <li>Rutas disponibles</li>
          </ul>
        </div>
        -->
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class MapViewComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private geolocationService = inject(GeolocationService);
  private router = inject(Router);

  private map!: Map;
  private userMarker!: Feature;
  private vectorSource!: VectorSource;
  private positionSubscription?: Subscription;

  isLoadingLocation = false;
  hasLocation = false;
  locationStatus = 'Cargando mapa...';
  errorMessage = '';

  // Juliaca coordinates
  private readonly JULIACA_COORDS = [-70.13, -15.5];

  ngOnInit(): void {
    this.initMap();
    this.requestUserLocation();
  }

  ngOnDestroy(): void {
    this.geolocationService.stopWatching();
    this.positionSubscription?.unsubscribe();
  }

  private initMap(): void {
    // Create vector source for markers
    this.vectorSource = new VectorSource();

    // Create vector layer
    const vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    // Create map
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat(this.JULIACA_COORDS),
        zoom: 13
      })
    });

    this.locationStatus = 'Mapa cargado - Juliaca';
  }

  private requestUserLocation(): void {
    this.isLoadingLocation = true;
    this.locationStatus = 'Obteniendo tu ubicación...';

    // Watch position for real-time updates
    this.positionSubscription = this.geolocationService.watchPosition().subscribe({
      next: (position) => {
        this.isLoadingLocation = false;
        this.hasLocation = true;
        this.locationStatus = 'Ubicación activa';
        this.errorMessage = '';
        this.updateUserMarker(position.lng, position.lat);
      },
      error: (error) => {
        this.isLoadingLocation = false;
        this.hasLocation = false;
        this.locationStatus = 'Ubicación no disponible';
        this.errorMessage = error;
      }
    });
  }

  private updateUserMarker(lng: number, lat: number): void {
    const coordinates = fromLonLat([lng, lat]);

    if (!this.userMarker) {
      // Create new marker
      this.userMarker = new Feature({
        geometry: new Point(coordinates)
      });

      // Style the marker
      this.userMarker.setStyle(new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: '#2563EB' // primary color
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 3
          })
        })
      }));

      this.vectorSource.addFeature(this.userMarker);
    } else {
      // Update existing marker
      const geometry = this.userMarker.getGeometry() as Point;
      geometry.setCoordinates(coordinates);
    }
  }

  centerOnUser(): void {
    if (!this.hasLocation) {
      this.requestUserLocation();
      return;
    }

    const geometry = this.userMarker?.getGeometry() as Point;
    if (geometry) {
      const coordinates = geometry.getCoordinates();
      this.map.getView().animate({
        center: coordinates,
        zoom: 16,
        duration: 500
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/card/my-card']);
  }
}
