# 🎯 PROMPT PARA CREAR BACKEND SPRING BOOT - TCI

Copia este prompt completo en tu workspace de backend:

---

Necesito crear un backend Spring Boot 3.2+ para mi aplicación de Transporte Colectivo Inteligente (TCI) que ya tengo desplegada en Angular 20.

## 📋 ESPECIFICACIONES DEL PROYECTO

### Información del Frontend (YA DESPLEGADO)
- **URL Frontend**: https://blueviolet-turkey-560833.hostingersite.com
- **URL API esperada**: https://blueviolet-turkey-560833.hostingersite.com/api
- **URL WebSocket esperada**: https://blueviolet-turkey-560833.hostingersite.com/ws

### Stack Tecnológico del Backend
- **Spring Boot**: 3.2.x
- **Java**: 17
- **Build**: Maven
- **Base de datos**: 
  - Desarrollo: H2 (in-memory)
  - Producción: PostgreSQL
- **WebSocket**: STOMP sobre SockJS
- **Seguridad**: JWT
- **ORM**: Spring Data JPA

### Dependencias Requeridas (pom.xml)
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

## 🗄️ MODELO DE DATOS

### Entidad User (Usuario - Pasajero)
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;
    
    @Column(unique = true, nullable = false, length = 8)
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

### Entidad Card (Tarjeta Virtual)
```java
@Entity
@Table(name = "cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Card {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(unique = true, nullable = false, length = 4)
    private String numero;
    
    @Enumerated(EnumType.STRING)
    private CardType tipo; // VIRTUAL, FISICA
    
    @Column(unique = true, nullable = false)
    private String qrCode;
    
    @Column(nullable = false)
    private Double balance = 15.50;
    
    private Boolean activa = true;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### Entidad Transaction (Transacción)
```java
@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    private TransactionType tipo; // PASAJE, RECARGA, VINCULACION
    
    @Column(nullable = false)
    private Double monto;
    
    private String descripcion;
    
    @CreationTimestamp
    private LocalDateTime fecha;
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus estado; // COMPLETADA, PENDIENTE, FALLIDA
}
```

---

## 🔐 ENDPOINTS REST REQUERIDOS

### 1. POST /api/auth/register
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

**Response** (201):
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
    "id": "card-uuid",
    "userId": "uuid-123",
    "numero": "5678",
    "tipo": "VIRTUAL",
    "qrCode": "TCI-uuid-123-timestamp",
    "balance": 15.50,
    "activa": true,
    "createdAt": "2025-01-28T10:00:00Z"
  }
}
```

**Reglas**:
- Crear usuario con password hasheado (BCrypt)
- Crear tarjeta virtual automáticamente
- Generar QR único
- Saldo inicial: S/ 15.50
- Generar JWT token
- Retornar todo en una sola respuesta

### 2. POST /api/auth/login
**Request**:
```json
{
  "identifier": "12345678",  // DNI o email
  "password": "securePass123"
}
```

**Response** (200):
```json
{
  "user": { /* mismo formato que register */ },
  "token": "jwt-token",
  "card": { /* tarjeta del usuario */ }
}
```

**Errores**:
- 401: Credenciales inválidas
- 404: Usuario no encontrado

### 3. GET /api/transactions/user/{userId}
**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
[
  {
    "id": "txn-uuid-1",
    "userId": "uuid-123",
    "tipo": "PASAJE",
    "monto": 2.50,
    "descripcion": "Pago adulto - Bus ABC123",
    "fecha": "2025-01-28T11:30:00Z",
    "estado": "COMPLETADA"
  }
]
```

### 4. POST /api/transactions
**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "userId": "uuid-123",
  "tipo": "PASAJE",
  "monto": 2.50,
  "descripcion": "Pago adulto - Bus ABC123"
}
```

**Response** (201):
```json
{
  "id": "txn-uuid-3",
  "userId": "uuid-123",
  "tipo": "PASAJE",
  "monto": 2.50,
  "descripcion": "Pago adulto - Bus ABC123",
  "fecha": "2025-01-28T12:00:00Z",
  "estado": "COMPLETADA"
}
```

---

## 🔌 WEBSOCKET STOMP

### Configuración WebSocket
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
                .setAllowedOrigins("https://blueviolet-turkey-560833.hostingersite.com", "http://localhost:4200", "capacitor://localhost")
                .withSockJS();
    }
}
```

### Endpoint 1: Recibir Pago de Pasajero
**Destino**: `/app/passenger/payment`

**Mensaje recibido**:
```json
{
  "busPlaca": "ABC-123",
  "adultos": 1,
  "escolares": 0,
  "total": 2.50,
  "passengerId": "uuid-123",
  "timestamp": 1738062000000
}
```

**Procesamiento**:
1. Recibir mensaje del pasajero
2. Validar saldo suficiente
3. Crear transacción
4. Actualizar balance de tarjeta
5. Emitir broadcast a `/topic/passenger/boarded`

### Endpoint 2: Broadcast a Conductores
**Topic**: `/topic/passenger/boarded`

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

### Endpoint 3: Conectar Conductor
**Destino**: `/app/driver/connect`

**Mensaje recibido**:
```json
{
  "placa": "ABC-123",
  "ruta": "Ruta 5",
  "driverName": "Pedro García"
}
```

### Endpoint 4: Ubicación Conductor
**Destino**: `/app/driver/location`

**Mensaje recibido**:
```json
{
  "placa": "ABC-123",
  "lat": -15.5,
  "lng": -70.1333,
  "speed": 35.5,
  "heading": 120,
  "timestamp": 1738062000000
}
```

---

## 🔒 SEGURIDAD Y CORS

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "https://blueviolet-turkey-560833.hostingersite.com",
            "http://localhost:4200",
            "capacitor://localhost"
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

### JWT Configuration
**application.properties**:
```properties
# JWT
jwt.secret=tci-super-secret-key-cambiar-en-produccion-2025
jwt.expiration=86400000

# H2 Database (Development)
spring.datasource.url=jdbc:h2:mem:tcidb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# Server
server.port=8080
```

---

## 🚀 DEPLOYMENT EN HOSTINGER

### Archivo application-prod.properties
```properties
spring.profiles.active=prod

# PostgreSQL (Production)
spring.datasource.url=jdbc:postgresql://localhost:5432/tci_db
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# Server
server.port=8080
```

### Script de Build
```bash
# Crear JAR
mvn clean package -DskipTests

# JAR ubicado en:
# target/tci-backend-0.0.1-SNAPSHOT.jar
```

### Systemd Service (para Hostinger VPS)
**Archivo**: `/etc/systemd/system/tci-backend.service`
```ini
[Unit]
Description=TCI Backend Spring Boot
After=syslog.target network.target

[Service]
User=tci
ExecStart=/usr/bin/java -jar /opt/tci/tci-backend-0.0.1-SNAPSHOT.jar
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

### Nginx Reverse Proxy
**Archivo**: `/etc/nginx/sites-available/tci`
```nginx
server {
    listen 80;
    server_name blueviolet-turkey-560833.hostingersite.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name blueviolet-turkey-560833.hostingersite.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend (Angular)
    location / {
        root /home/user/public_html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
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

---

## 📝 TAREAS A REALIZAR

Por favor, crea el proyecto completo con:

1. **Estructura del proyecto**:
   - Paquete base: `com.tci.backend`
   - Configuraciones: `config/`
   - Controladores: `controller/`
   - DTOs: `dto/`
   - Entidades: `entity/`
   - Repositorios: `repository/`
   - Servicios: `service/`
   - Seguridad: `security/`

2. **Implementar**:
   - ✅ Entidades: User, Card, Transaction
   - ✅ Repositorios JPA
   - ✅ DTOs para Request/Response
   - ✅ JWT Token Provider
   - ✅ JWT Authentication Filter
   - ✅ Security Config
   - ✅ CORS Config
   - ✅ WebSocket Config
   - ✅ AuthService y AuthController
   - ✅ TransactionService y TransactionController
   - ✅ WebSocket Controller para STOMP

3. **Datos de prueba**:
   - Usuario demo: DNI 12345678, password: demo123
   - Saldo inicial: S/ 15.50

4. **Archivos de deployment**:
   - ✅ `Dockerfile` (opcional)
   - ✅ Script de build
   - ✅ Instrucciones de deployment para Hostinger

5. **Testing**:
   - ✅ Tests básicos de endpoints
   - ✅ Instrucciones para probar con Postman

---

## 🎯 RESULTADO ESPERADO

Al finalizar, debo poder:
1. Ejecutar `mvn spring-boot:run` en desarrollo
2. Registrar usuario en `/api/auth/register`
3. Login en `/api/auth/login` y recibir JWT
4. Crear transacciones con JWT
5. Conectar WebSocket desde el frontend Angular
6. Enviar pagos vía STOMP
7. Recibir notificaciones en tiempo real
8. Generar JAR y desplegar en Hostinger

---

**URL del Frontend**: https://blueviolet-turkey-560833.hostingersite.com  
**CORS permitido**: https://blueviolet-turkey-560833.hostingersite.com  
**Puerto backend**: 8080  
**Base de datos dev**: H2  
**Base de datos prod**: PostgreSQL  

¡Crea el proyecto completo y funcional!
