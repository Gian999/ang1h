# 🔄 Migración de Angular a Backend Real

## ✅ Cambios Completados

### 1. Instalación de Dependencias WebSocket STOMP
```bash
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client
```

**Removido**: `socket.io-client` (incompatible con Spring Boot)  
**Agregado**: `@stomp/stompjs` + `sockjs-client` (compatible con Spring Boot STOMP)

---

### 2. Archivos de Entorno Creados

#### `src/environments/environment.ts` (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'http://localhost:8080/ws',
  mapboxToken: 'pk.eyJ1IjoibWFydGluem9ycmlsbGEi...'
};
```

#### `src/environments/environment.prod.ts` (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio-hostinger.com/api',
  wsUrl: 'https://tu-dominio-hostinger.com/ws',
  mapboxToken: 'pk.eyJ1IjoibWFydGluem9ycmlsbGEi...'
};
```

---

### 3. Configuración de Angular (`angular.json`)

Agregado `fileReplacements` para producción:
```json
"production": {
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.prod.ts"
    }
  ]
}
```

---

### 4. WebSocketService - Migrado a STOMP

**Antes** (socket.io):
```typescript
import { io, Socket } from 'socket.io-client';
this.socket = io(serverUrl);
this.socket.emit(event, data);
```

**Después** (STOMP):
```typescript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

this.stompClient = new Client({
  webSocketFactory: () => new SockJS(environment.wsUrl),
  // ...
});

this.stompClient.publish({
  destination: '/app/passenger/payment',
  body: JSON.stringify(data)
});
```

**Destinos STOMP**:
- `/app/passenger/payment` - Enviar pago
- `/topic/passenger/boarded` - Recibir notificación
- `/app/driver/connect` - Conectar conductor
- `/app/driver/location` - Enviar ubicación

---

### 5. AuthService - Migrado a HTTP

**Antes** (localStorage demo):
```typescript
register(userData: RegisterDto): Observable<User> {
  const newUser: User = { ... }; // Simulado
  localStorage.setItem('user', JSON.stringify(newUser));
  return of(newUser).pipe(delay(1000));
}
```

**Después** (HTTP real):
```typescript
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

register(userData: RegisterDto): Observable<User> {
  return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData)
    .pipe(
      tap(response => {
        localStorage.setItem('tci_current_user', JSON.stringify(response.user));
        localStorage.setItem('tci_token', response.token);
        if (response.card) {
          localStorage.setItem('tci_card', JSON.stringify(response.card));
        }
      }),
      map(response => response.user)
    );
}
```

**Nuevos métodos**:
- `getToken()`: Retorna JWT del localStorage
- `isAuthenticated()`: Valida usuario Y token

**Interfaz de respuesta**:
```typescript
interface AuthResponse {
  user: User;
  token: string;
  card?: Card;
}
```

---

### 6. TransactionService - Migrado a HTTP

**Nuevos métodos HTTP**:

```typescript
// Cargar transacciones del backend
loadUserTransactions(userId: string): Observable<Transaction[]> {
  return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions/user/${userId}`)
    .pipe(
      tap(transactions => {
        this.transactions.set(transactions);
        localStorage.setItem('tci_transactions', JSON.stringify(transactions));
      })
    );
}

// Crear transacción en backend
createTransaction(transaction: Omit<Transaction, 'id' | 'fecha'>): Observable<Transaction> {
  return this.http.post<Transaction>(`${environment.apiUrl}/transactions`, transaction)
    .pipe(
      tap(newTransaction => {
        const updated = [newTransaction, ...this.transactions()];
        this.transactions.set(updated);
      })
    );
}
```

**Método legacy mantenido**:
- `addTransaction()`: Para demo/fallback local

---

### 7. App Config - HttpClient Provider

**Agregado en `app.config.ts`**:
```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    provideHttpClient()
  ]
};
```

---

## 🔧 Pasos Siguientes

### Para el Frontend (Opcional)

1. **Crear Interceptor JWT**:
   ```bash
   ng generate interceptor core/interceptors/jwt
   ```
   Para agregar automáticamente el token a las peticiones HTTP.

2. **Actualizar componentes**:
   - `login.component.ts`: Ya funciona con HTTP
   - `register.component.ts`: Ya funciona con HTTP
   - `pay-fare.component.ts`: Ya usa WebSocket STOMP
   - `driver-map.component.ts`: Ya usa WebSocket STOMP

### Para el Backend (URGENTE)

1. **Crear proyecto Spring Boot**:
   - Ver especificación completa en `BACKEND_SPEC.md`
   - Spring Boot 3.2 + WebSocket STOMP + JWT + JPA

2. **Implementar endpoints**:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/transactions/user/{userId}`
   - `POST /api/transactions`
   - WebSocket: `/ws` (SockJS endpoint)

3. **Deploy en Hostinger**:
   - Configurar PostgreSQL
   - Configurar Nginx reverse proxy
   - Actualizar `environment.prod.ts` con URL real

---

## 📊 Comparación Antes/Después

| Aspecto | Antes (Demo) | Después (Producción) |
|---------|-------------|---------------------|
| **WebSocket** | socket.io-client | STOMP + SockJS |
| **Backend** | Simulado (localStorage) | Spring Boot REST API |
| **Auth** | Credenciales hardcoded | JWT + HTTP |
| **Transacciones** | localStorage | Base de datos PostgreSQL |
| **Despliegue** | Solo frontend | Frontend + Backend |
| **Tiempo real** | Simulado (timeout) | WebSocket real STOMP |

---

## 🐛 Notas de Compatibilidad

### Warning CommonJS (sockjs-client)
```
Module 'sockjs-client' used by 'websocket.service.ts' is not ESM
```

**Explicación**: sockjs-client es CommonJS, no ESM nativo.  
**Impacto**: Ninguno funcional, solo aviso de optimización.  
**Solución**: Ignorar o agregar a `angular.json`:
```json
"allowedCommonJsDependencies": ["sockjs-client"]
```

---

## ✅ Build Status

```bash
npm run build
# ✅ Compilación exitosa
# 📦 Bundle size: 329.95 kB (87.49 kB compressed)
# ⚠️ 1 warning (sockjs-client CommonJS - no afecta funcionalidad)
```

---

## 🚀 Cómo Probar

### Con Backend Local (desarrollo)

1. **Ejecutar backend Spring Boot**:
   ```bash
   cd ../backend-spring
   mvn spring-boot:run
   ```

2. **Ejecutar Angular**:
   ```bash
   npm start
   ```

3. **Navegar a**: `http://localhost:4200`

### Con Backend en Hostinger (producción)

1. **Build producción**:
   ```bash
   npm run build
   ```

2. **Deploy a Hostinger** (hosting estático):
   ```bash
   # Subir carpeta dist/hackaton1 a tu hosting
   ```

3. **Verificar**: `https://tu-dominio.com`

---

## 📝 URLs de Configuración

| Entorno | Frontend | Backend API | WebSocket |
|---------|----------|-------------|-----------|
| **Dev** | http://localhost:4200 | http://localhost:8080/api | http://localhost:8080/ws |
| **Prod** | https://tu-dominio.com | https://tu-dominio-hostinger.com/api | https://tu-dominio-hostinger.com/ws |

---

## 🔐 Consideraciones de Seguridad

1. **JWT Secret**: Cambiar en producción (`application-prod.properties`)
2. **CORS**: Configurar solo dominios permitidos
3. **HTTPS**: Obligatorio en producción
4. **WebSocket**: SockJS requiere sticky sessions en load balancer
5. **Database**: PostgreSQL con credenciales seguras

---

## 📚 Documentación de Referencia

- [Spring WebSocket Guide](https://spring.io/guides/gs/messaging-stomp-websocket/)
- [STOMP.js Documentation](https://stomp-js.github.io/stomp-websocket/codo/extra/docs-src/Usage.md.html)
- [Angular HttpClient](https://angular.io/guide/http)
- [JWT Best Practices](https://auth0.com/blog/jwt-authentication-best-practices/)

---

**Fecha de migración**: 28 de enero de 2025  
**Estado**: ✅ Frontend migrado completamente  
**Pendiente**: 🔄 Backend Spring Boot (ver BACKEND_SPEC.md)
