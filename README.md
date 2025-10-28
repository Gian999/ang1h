# 🚀 TRANSPORTE COLECTIVO INTELIGENTE - JULIACA

## 📱 Aplicación Móvil de Transporte Urbano

Sistema completo de pago digital para transporte público en Juliaca, Perú.

---

## 🏗️ Configuración de Backend

### Configuración de Entornos

El proyecto utiliza archivos de entorno para configurar las URLs del backend:

- **Desarrollo**: `src/environments/environment.ts`
  ```typescript
  apiUrl: 'http://localhost:8080/api'
  wsUrl: 'http://localhost:8080/ws'
  ```

- **Producción**: `src/environments/environment.prod.ts`
  ```typescript
  apiUrl: 'https://tu-dominio-hostinger.com/api'
  wsUrl: 'https://tu-dominio-hostinger.com/ws'
  ```

### Backend Requerido (Spring Boot 3.2+)

Para que esta aplicación funcione correctamente, necesitas un backend Spring Boot con:

1. **WebSocket con STOMP**: Para comunicación en tiempo real
2. **API REST**: Para autenticación y transacciones
3. **JWT Security**: Para autenticación con tokens
4. **Base de datos**: H2 (dev) o PostgreSQL (producción)
5. **CORS**: Configurado para permitir peticiones desde la app Angular

**Endpoints principales**:
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login (retorna JWT + usuario + tarjeta)
- `GET /api/transactions/user/{userId}` - Listado de transacciones
- `POST /api/transactions` - Crear transacción
- `STOMP /app/passenger/payment` - Enviar pago (WebSocket)
- `STOMP /topic/passenger/boarded` - Notificación pasajero abordado

---

## 🚀 Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```


## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

## ✅ MÓDULOS IMPLEMENTADOS

### ✅ MÓDULO 00-07 - Aplicación Completa
- ✅ **Angular 20.3.0** + Tailwind CSS 4.1.16
- ✅ **Pasajeros**: Welcome, Register, Login, MyCard, ScanQR ⭐, PayFare ⭐, Recharge, Movements, Profile, MapView
- ✅ **Conductores**: DriverWelcome, DriverRegister (4 pasos), DriverLogin (2FA + GPS), DriverMap (Mapbox 3D) ⭐
- ✅ **WebSocket** ⭐: Comunicación en tiempo real (modo demo)
- ✅ **Servicios**: Auth, Driver, Transaction, Card, Bus, Geolocation, WebSocket, Storage
- ✅ **Componentes Shared**: DNI Input, Balance Card, Numeric Stepper, Transaction List, Amount Selector, QR Code, Ticket, Map Controls

---

## 🎯 CREDENCIALES DEMO

### Pasajero
```
DNI: 12345678
Contraseña: demo123
Saldo inicial: S/ 15.50
```

### Conductor
```
DNI: 87654321
Contraseña: conductor123
Código 2FA: 123456
Placa: ABC123
Ruta: Ruta 5
```

### QR Demo del Microbus
```
BUS:ABC123:Ruta 5:VALID001
```

---

## 📱 ANDROID

### Ejecutar en Android
```bash
# Sincronizar con Android
npx cap sync android

# Abrir en Android Studio
npx cap open android

# O ejecutar directamente
npx cap run android
```

---

## 🎨 TECNOLOGÍAS

- **Frontend**: Angular 20.3.0
- **Estilos**: Tailwind CSS 4.1.16
- **Mapas Pasajeros**: OpenLayers 10.6.1
- **Mapas Conductores**: Mapbox GL v2.15.0
- **WebSocket**: Socket.io Client (modo demo)
- **Mobile**: Capacitor 7.4.4
- **Geolocalización**: Capacitor Geolocation

---

## 📊 CARACTERÍSTICAS PRINCIPALES

### 🚌 Portal Pasajeros
- ✅ Registro en 3 pasos con validación
- ✅ Login seguro
- ✅ **Escaneo de QR del microbus** (no genera QR propio)
- ✅ **Pago directo de pasaje** (adultos S/1.00, escolares S/0.50)
- ✅ Recarga de saldo (Yape, Plin, Tarjeta, Agente)
- ✅ Historial de movimientos
- ✅ Mapa con geolocalización (OpenLayers)

### 🚙 Portal Conductores
- ✅ Registro en 4 pasos (incluye datos del vehículo)
- ✅ **Login con 2FA + solicitud GPS automática**
- ✅ **Mapa 3D con Mapbox GL**
- ✅ **GPS tracking obligatorio al activar servicio**
- ✅ **Panel de stats colapsable** (oculto por defecto)
- ✅ **Auto-expansión del panel** al recibir pasajero
- ✅ Métricas en tiempo real: Pasajeros, Recaudado, Velocidad, Distancia

### 🔌 WebSocket (Tiempo Real)
- ✅ Modo demo sin backend
- ✅ Eventos PASSENGER_PAYMENT → PASSENGER_BOARDED
- ✅ Sincronización pasajero-conductor
- ✅ Actualización automática de stats

---

## ✅ CHECKLIST COMPLETO

### Pasajeros
- [x] Welcome, Register, Login
- [x] MyCard con saldo
- [x] **ScanQR - escanea QR del microbus ⭐**
- [x] **PayFare - pago directo sin generar QR ⭐**
- [x] Recharge con múltiples métodos
- [x] Movements con historial
- [x] Profile con logout
- [x] MapView con geolocalización

### Conductores
- [x] DriverWelcome, DriverRegister (4 pasos)
- [x] **DriverLogin con 2FA + GPS ⭐**
- [x] **DriverMap con Mapbox 3D ⭐**
- [x] **Panel stats colapsable ⭐**
- [x] **GPS tracking obligatorio ⭐**
- [x] **Auto-expansión con pasajero ⭐**

### WebSocket
- [x] Servicio implementado
- [x] Modo demo activo
- [x] PayFare envía eventos
- [x] DriverMap recibe eventos
- [x] Stats actualizadas en tiempo real

---

## 🎉 VERSIÓN ACTUAL

**v1.0.3 Final** - Todos los módulos completados (00-07)

---

## 🚀 DEPLOYMENT

### Desarrollo Local
```bash
npm start
# App: http://localhost:4200
```

### Producción en Hostinger

**Opción 1: Script Automatizado (Recomendado)**
```powershell
.\deploy.ps1
```
El script:
- ✅ Verifica configuración
- ✅ Compila para producción
- ✅ Copia .htaccess
- ✅ Crea ZIP para subir
- ✅ Muestra instrucciones

**Opción 2: Manual**
```bash
# 1. Actualizar environment.prod.ts con tu dominio
# 2. Build
npm run build

# 3. Subir dist/hackaton1/* a public_html/ en Hostinger
# 4. Subir .htaccess a public_html/
# 5. Activar SSL
# 6. Abrir https://tudominio.com
```

📖 **Guía completa**: Ver `DEPLOY_HOSTINGER.md`

### Backend Requerido
El frontend está listo para conectar con backend Spring Boot.

📋 **Especificación completa**: Ver `BACKEND_SPEC.md`

**Endpoints necesarios**:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/transactions/user/{userId}`
- `POST /api/transactions`
- WebSocket STOMP en `/ws`

---

**Proyecto**: Transporte Colectivo Inteligente  
**Ubicación**: Juliaca, Puno, Perú 🇵🇪  
**Versión**: 1.1.0 - Backend Integration Ready  
**Fecha**: 28 de enero, 2025
