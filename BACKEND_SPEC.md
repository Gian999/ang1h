# 🖥️ Especificación Backend Spring Boot - TCI

## 📋 Resumen Ejecutivo

Backend Spring Boot 3.2 para la aplicación de Transporte Colectivo Inteligente (TCI) de Juliaca, con soporte para WebSocket STOMP, autenticación JWT, y API REST completa.

---

## 🏗️ Arquitectura

### Stack Tecnológico
- **Spring Boot**: 3.2.x
- **Java**: 17+
- **Spring WebSocket**: STOMP sobre SockJS
- **Spring Security**: JWT Authentication
- **Spring Data JPA**: ORM
- **Base de datos**:
  - Desarrollo: H2 (in-memory)
  - Producción: PostgreSQL 14+
- **Build Tool**: Maven 3.9+

### Estructura de Paquetes
```
com.tci.backend
├── config/
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   └── CorsConfig.java
├── controller/
│   ├── AuthController.java
│   ├── TransactionController.java
│   └── WebSocketController.java
├── dto/
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── AuthResponse.java
│   ├── PaymentMessage.java
│   └── BoardingNotification.java
├── entity/
│   ├── User.java
│   ├── Card.java
│   └── Transaction.java
├── repository/
│   ├── UserRepository.java
│   ├── CardRepository.java
│   └── TransactionRepository.java
├── service/
│   ├── AuthService.java
│   ├── TransactionService.java
│   └── WebSocketService.java
├── security/
│   ├── JwtTokenProvider.java
│   └── JwtAuthenticationFilter.java
└── BackendApplication.java
```

---

## 🔐 Endpoints REST

### 1. Autenticación (`/api/auth`)

#### POST `/api/auth/register`
**Request**:
```json
{
  "dni": "12345678",
  "nombres": "Juan Carlos",
  "apellidos": "Mamani Quispe",
  "fechaNacimiento": "1990-01-15",
  "email": "juan@example.com",
  "celular": "987654321",
  "distrito": "Juliaca",
  "password": "securePass123"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid-123",
    "dni": "12345678",
    "nombres": "Juan Carlos",
    "apellidos": "Mamani Quispe",
    "fechaNacimiento": "1990-01-15",
    "email": "juan@example.com",
    "celular": "987654321",
    "distrito": "Juliaca",
    "createdAt": "2025-01-28T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "card": {
    "id": "card-uuid-456",
    "userId": "uuid-123",
    "numero": "5678",
    "tipo": "virtual",
    "qrCode": "TCI-uuid-123-1738062000000",
    "balance": 15.50,
    "activa": true,
    "createdAt": "2025-01-28T10:00:00Z"
  }
}
```

#### POST `/api/auth/login`
**Request**:
```json
{
  "identifier": "12345678",  // DNI o email
  "password": "securePass123"
}
```

**Response** (200 OK):
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "card": { ... }
}
```

**Errors**:
- 401 Unauthorized: Credenciales inválidas
- 404 Not Found: Usuario no encontrado

---

### 2. Transacciones (`/api/transactions`)

#### GET `/api/transactions/user/{userId}`
**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
[
  {
    "id": "txn-uuid-1",
    "userId": "uuid-123",
    "tipo": "pasaje",
    "monto": 2.50,
    "descripcion": "Pago adulto - Bus XYZ123",
    "fecha": "2025-01-28T11:30:00Z",
    "estado": "completada"
  },
  {
    "id": "txn-uuid-2",
    "userId": "uuid-123",
    "tipo": "recarga",
    "monto": 20.00,
    "descripcion": "Recarga por Yape",
    "fecha": "2025-01-28T09:00:00Z",
    "estado": "completada"
  }
]
```

#### POST `/api/transactions`
**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "userId": "uuid-123",
  "tipo": "pasaje",
  "monto": 2.50,
  "descripcion": "Pago adulto - Bus XYZ123"
}
```

**Response** (201 Created):
```json
{
  "id": "txn-uuid-3",
  "userId": "uuid-123",
  "tipo": "pasaje",
  "monto": 2.50,
  "descripcion": "Pago adulto - Bus XYZ123",
  "fecha": "2025-01-28T12:00:00Z",
  "estado": "completada"
}
```

---

## 🔌 WebSocket STOMP

### Configuración
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:4200", "capacitor://localhost", "https://tu-dominio-hostinger.com")
                .withSockJS();
    }
}
```

### Endpoints WebSocket

#### 1. Enviar Pago de Pasajero
**Destino**: `/app/passenger/payment`

**Mensaje**:
```json
{
  "busPlaca": "XYZ-123",
  "adultos": 1,
  "escolares": 0,
  "total": 2.50,
  "passengerId": "uuid-123",
  "timestamp": 1738062000000
}
```

**Procesamiento**:
1. Backend recibe el mensaje
2. Procesa el pago (actualiza balance, crea transacción)
3. Emite notificación broadcast a `/topic/passenger/boarded`

---

#### 2. Notificación de Pasajero Abordado
**Topic**: `/topic/passenger/boarded` (broadcast)

**Mensaje emitido**:
```json
{
  "adultos": 1,
  "escolares": 0,
  "total": 2.50,
  "timestamp": 1738062000000,
  "totalPassengers": 15,
  "totalCollected": 37.50
}
```

**Suscriptores**:
- Conductores en servicio
- Dashboard administrativo (futuro)

---

#### 3. Conectar Conductor
**Destino**: `/app/driver/connect`

**Mensaje**:
```json
{
  "placa": "XYZ-123",
  "ruta": "Ruta 5",
  "driverName": "Pedro García"
}
```

**Procesamiento**:
1. Backend registra conductor como activo
2. Asocia WebSocket session con conductor
3. Prepara estadísticas iniciales

---

#### 4. Actualización de Ubicación
**Destino**: `/app/driver/location`

**Mensaje**:
```json
{
  "placa": "XYZ-123",
  "lat": -15.5,
  "lng": -70.1333,
  "speed": 35.5,
  "heading": 120,
  "timestamp": 1738062000000
}
```

**Procesamiento**:
1. Backend actualiza ubicación en tiempo real
2. Emite a `/topic/bus/location` para pasajeros cercanos

---

## 🗄️ Modelo de Datos

### Entidad `User`
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    private String id;
    
    @Column(unique = true, nullable = false)
    private String dni;
    
    @Column(nullable = false)
    private String nombres;
    
    @Column(nullable = false)
    private String apellidos;
    
    private LocalDate fechaNacimiento;
    
    @Column(unique = true)
    private String email;
    
    private String celular;
    private String distrito;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Card card;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Transaction> transactions;
}
```

### Entidad `Card`
```java
@Entity
@Table(name = "cards")
public class Card {
    @Id
    @GeneratedValue(generator = "UUID")
    private String id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(unique = true, nullable = false)
    private String numero;
    
    @Enumerated(EnumType.STRING)
    private CardType tipo; // virtual, fisica
    
    @Column(unique = true, nullable = false)
    private String qrCode;
    
    @Column(nullable = false)
    private Double balance = 15.50;
    
    private Boolean activa = true;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### Entidad `Transaction`
```java
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(generator = "UUID")
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Enumerated(EnumType.STRING)
    private TransactionType tipo; // pasaje, recarga, vinculacion
    
    @Column(nullable = false)
    private Double monto;
    
    private String descripcion;
    
    @CreationTimestamp
    private LocalDateTime fecha;
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus estado; // completada, pendiente, fallida
}
```

---

## 🔒 Seguridad

### JWT Configuration
```yaml
jwt:
  secret: ${JWT_SECRET:tu-super-secret-key-cambiar-en-produccion}
  expiration: 86400000  # 24 horas en milisegundos
```

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "capacitor://localhost",
            "https://tu-dominio-hostinger.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## 🚀 Deployment en Hostinger

### Requisitos de Hostinger
- VPS o Cloud Hosting con Java 17+
- Base de datos PostgreSQL
- Acceso SSH
- Nginx (reverse proxy)

### Variables de Entorno
```bash
# application-prod.properties
spring.profiles.active=prod
spring.datasource.url=jdbc:postgresql://localhost:5432/tci_db
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
server.port=8080
```

### Configuración Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio-hostinger.com;

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### Comandos de Deployment
```bash
# 1. Build JAR
mvn clean package -DskipTests

# 2. Copiar a servidor
scp target/backend-0.0.1-SNAPSHOT.jar user@hostinger:/opt/tci/

# 3. Ejecutar en servidor (con systemd)
sudo systemctl start tci-backend
sudo systemctl enable tci-backend
```

### Systemd Service (`/etc/systemd/system/tci-backend.service`)
```ini
[Unit]
Description=TCI Backend Spring Boot
After=syslog.target network.target

[Service]
User=tci
ExecStart=/usr/bin/java -jar /opt/tci/backend-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="DB_USER=tci_user"
Environment="DB_PASSWORD=secure_password"
Environment="JWT_SECRET=production-secret-key-muy-seguro"

[Install]
WantedBy=multi-user.target
```

---

## 📦 Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## ✅ Checklist de Implementación

### Fase 1: Setup Inicial
- [ ] Crear proyecto Spring Boot 3.2 con Spring Initializr
- [ ] Configurar `pom.xml` con todas las dependencias
- [ ] Configurar `application.properties` (dev y prod)
- [ ] Crear estructura de paquetes

### Fase 2: Seguridad
- [ ] Implementar `JwtTokenProvider`
- [ ] Implementar `JwtAuthenticationFilter`
- [ ] Configurar `SecurityConfig`
- [ ] Configurar `CorsConfig`

### Fase 3: Entidades y Repositorios
- [ ] Crear entidad `User` con validaciones
- [ ] Crear entidad `Card`
- [ ] Crear entidad `Transaction`
- [ ] Crear repositorios JPA

### Fase 4: Servicios y Controladores REST
- [ ] Implementar `AuthService` (register, login)
- [ ] Implementar `AuthController`
- [ ] Implementar `TransactionService`
- [ ] Implementar `TransactionController`

### Fase 5: WebSocket
- [ ] Configurar `WebSocketConfig`
- [ ] Implementar `WebSocketController`
- [ ] Implementar handlers para:
  - Pago de pasajero
  - Conexión de conductor
  - Actualización de ubicación

### Fase 6: Testing
- [ ] Tests unitarios de servicios
- [ ] Tests de integración de controladores
- [ ] Tests de WebSocket
- [ ] Pruebas con Postman/Insomnia

### Fase 7: Deployment
- [ ] Configurar PostgreSQL en servidor
- [ ] Configurar variables de entorno
- [ ] Crear systemd service
- [ ] Configurar Nginx reverse proxy
- [ ] Deploy y verificación

---

## 📞 Contacto

**Desarrollado para**: Transporte Colectivo Inteligente - Juliaca, Perú  
**Versión Backend**: 1.0.0  
**Fecha**: Enero 2025
