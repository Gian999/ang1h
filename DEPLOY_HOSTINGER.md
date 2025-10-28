# 🚀 Guía de Deployment en Hostinger

## 📋 Pre-requisitos

- ✅ Cuenta de Hostinger activa
- ✅ Dominio configurado (opcional: subdominio)
- ✅ Acceso a File Manager o FTP
- ✅ Backend Spring Boot desplegado (ver BACKEND_SPEC.md)

---

## 🔧 Paso 1: Configurar URL del Backend

### Editar `environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api',  // ← Cambiar por tu URL
  wsUrl: 'https://api.tudominio.com/ws',     // ← Cambiar por tu URL
  mapboxToken: 'pk.eyJ1IjoibWFydGluem9ycmlsbGEiLCJhIjoiY20zNGswNjc5MDNhOTJxcHlmZnoxZTliaCJ9.QqfPJxe3UyWo6w5OYs8Uow'
};
```

**Opciones de configuración**:

1. **Backend en mismo dominio** (recomendado):
   ```typescript
   apiUrl: 'https://tudominio.com/api'
   wsUrl: 'https://tudominio.com/ws'
   ```

2. **Backend en subdominio**:
   ```typescript
   apiUrl: 'https://api.tudominio.com/api'
   wsUrl: 'https://api.tudominio.com/ws'
   ```

3. **Backend en servidor separado**:
   ```typescript
   apiUrl: 'https://backend-server.com/api'
   wsUrl: 'https://backend-server.com/ws'
   ```

---

## 🏗️ Paso 2: Build de Producción

### 2.1 Limpiar build anterior (opcional)
```powershell
Remove-Item -Recurse -Force dist
```

### 2.2 Compilar para producción
```powershell
npm run build
```

**Resultado esperado**:
```
✓ Application bundle generation complete. [~5 segundos]
Output location: D:\ohshit\hackaton1\dist\hackaton1
```

### 2.3 Verificar archivos generados
```powershell
cd dist\hackaton1
ls
```

**Archivos esperados**:
- `index.html` ← Punto de entrada
- `styles-*.css` ← Estilos compilados
- `main-*.js` ← Código principal
- `polyfills-*.js` ← Polyfills
- `chunk-*.js` ← Lazy-loaded chunks
- `favicon.ico`
- Carpeta `browser/` (si existe)

---

## 📤 Paso 3: Subir a Hostinger

### Opción A: File Manager (Recomendado para principiantes)

1. **Login a Hostinger**:
   - Ir a https://hpanel.hostinger.com
   - Iniciar sesión

2. **Abrir File Manager**:
   - Hosting → Manage
   - Files → File Manager

3. **Navegar a public_html**:
   ```
   /home/usuario/public_html
   ```

4. **Limpiar directorio** (si es primera vez):
   - Seleccionar todos los archivos
   - Delete

5. **Subir archivos**:
   - Click en "Upload Files"
   - Seleccionar **TODOS** los archivos de `dist\hackaton1\`
   - O comprimir en .zip y subir → Extract

6. **Copiar `.htaccess`**:
   - Subir el archivo `.htaccess` del proyecto
   - Asegurar que esté en `public_html/.htaccess`

### Opción B: FTP (Recomendado para desarrolladores)

1. **Configurar FTP Client (FileZilla)**:
   - Host: `ftp.tudominio.com`
   - Usuario: Usuario de Hostinger
   - Password: Contraseña de Hostinger
   - Puerto: 21

2. **Conectar y navegar**:
   - Carpeta remota: `/public_html`

3. **Subir archivos**:
   - Seleccionar todo el contenido de `dist\hackaton1\`
   - Arrastrar a `/public_html/`

4. **Verificar `.htaccess`**:
   - Asegurar que `.htaccess` está en la raíz

### Opción C: Git Deploy (Avanzado)

```bash
# En Hostinger via SSH
cd ~/public_html
git init
git remote add origin tu-repositorio.git
git pull origin main

# Script de deploy
npm run build
cp -r dist/hackaton1/* .
```

---

## 🌐 Paso 4: Configurar Dominio/Subdominio

### Para Dominio Principal
Si quieres que la app esté en `https://tudominio.com`:
- Los archivos ya deben estar en `public_html/`
- ✅ Listo

### Para Subdominio
Si quieres `https://app.tudominio.com`:

1. **Crear Subdominio en Hostinger**:
   - Domains → Subdomains
   - Create Subdomain: `app`
   - Document Root: `/public_html/app`

2. **Subir archivos a carpeta del subdominio**:
   ```
   /public_html/app/
   ```

---

## 🔒 Paso 5: Configurar SSL (HTTPS)

### En Hostinger Panel

1. **Ir a Security**:
   - SSL → Manage SSL

2. **Activar SSL gratuito**:
   - Click en "Get SSL" (Let's Encrypt)
   - Esperar 1-5 minutos

3. **Forzar HTTPS** (agregar a `.htaccess`):
   ```apache
   # Forzar HTTPS
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

---

## ✅ Paso 6: Verificar Deployment

### 6.1 Probar la App
Abrir en navegador:
```
https://tudominio.com
```

### 6.2 Verificar Rutas
Probar navegación:
- ✅ `https://tudominio.com/` → Welcome
- ✅ `https://tudominio.com/passenger/login` → Login
- ✅ `https://tudominio.com/driver/login` → Driver Login

Si las rutas no funcionan, verificar `.htaccess`.

### 6.3 Abrir DevTools
Presionar F12 y verificar:
- ✅ No hay errores 404
- ✅ No hay errores CORS
- ⚠️ Error de conexión backend (normal si backend no está listo)

### 6.4 Verificar Backend Connection
En consola del navegador:
```javascript
console.log(environment.apiUrl);
// Debe mostrar: "https://tudominio.com/api" o tu URL configurada
```

---

## 🐛 Troubleshooting

### Problema 1: Error 404 en rutas
**Síntoma**: `/passenger/login` muestra 404

**Solución**:
- Verificar que `.htaccess` existe en `public_html/`
- Verificar que `mod_rewrite` está habilitado (contactar soporte Hostinger)

### Problema 2: Archivos no se cargan
**Síntoma**: Pantalla blanca o errores 404 en archivos JS/CSS

**Solución**:
- Verificar que todos los archivos de `dist/hackaton1/` están en `public_html/`
- Verificar permisos: archivos 644, carpetas 755

### Problema 3: CORS Error
**Síntoma**: `Access-Control-Allow-Origin` error en consola

**Solución**:
- Configurar CORS en backend Spring Boot
- Agregar dominio frontend a `allowedOrigins`:
  ```java
  configuration.setAllowedOrigins(Arrays.asList(
      "https://tudominio.com"
  ));
  ```

### Problema 4: WebSocket no conecta
**Síntoma**: `WebSocket connection failed` en consola

**Solución**:
- Verificar que backend STOMP está corriendo
- Verificar URL WebSocket en `environment.prod.ts`
- Verificar que Nginx/Apache permite WebSocket (Upgrade headers)

### Problema 5: SSL Mixed Content
**Síntoma**: `Mixed Content` warnings

**Solución**:
- Asegurar que `apiUrl` y `wsUrl` usan `https://` (no `http://`)
- Verificar que Mapbox token es válido

---

## 📁 Estructura Final en Hostinger

```
/public_html/
├── .htaccess                    ← Rewrite rules
├── index.html                   ← Entry point
├── favicon.ico
├── styles-HASH.css
├── main-HASH.js
├── polyfills-HASH.js
├── chunk-*.js                   ← Lazy chunks
└── (otros archivos del build)
```

---

## 🔄 Re-deployment (Actualizar App)

Cuando hagas cambios al código:

1. **Build local**:
   ```powershell
   npm run build
   ```

2. **Subir solo archivos modificados**:
   - FTP: Sobrescribir archivos en `public_html/`
   - File Manager: Delete old files → Upload new files

3. **Limpiar caché del navegador**:
   - Ctrl + Shift + R (force reload)
   - O borrar caché manualmente

---

## 📊 Optimizaciones Post-Deploy

### 1. Comprimir Recursos
En `.htaccess` ya está configurado Gzip.

### 2. CDN (Opcional)
Hostinger ofrece Cloudflare CDN gratis:
- Hosting → Performance → Cloudflare
- Activar CDN

### 3. Cache Headers
Ya configurados en `.htaccess`:
- Images: 1 año
- CSS/JS: 1 mes

### 4. Monitoreo
Configurar Google Analytics o similar en `index.html`.

---

## 🎯 Checklist de Deployment

### Pre-Deploy
- [ ] Backend Spring Boot desplegado y funcionando
- [ ] URL del backend actualizada en `environment.prod.ts`
- [ ] Build de producción exitoso
- [ ] Archivos `.htaccess` preparado

### Deploy
- [ ] Archivos subidos a Hostinger
- [ ] `.htaccess` en la raíz de `public_html/`
- [ ] SSL activado (HTTPS)
- [ ] Dominio/Subdominio configurado

### Post-Deploy
- [ ] App carga correctamente en navegador
- [ ] Rutas funcionan (no 404)
- [ ] No hay errores en consola (excepto backend si no está listo)
- [ ] WebSocket conecta al backend
- [ ] Login/Register funcionan
- [ ] Cache configurado

---

## 📞 Soporte

**Hostinger Support**:
- Chat: 24/7 en hpanel.hostinger.com
- Tutoriales: https://www.hostinger.com/tutorials

**Problemas técnicos de la app**:
- Ver `MIGRATION_NOTES.md`
- Ver `BACKEND_SPEC.md`

---

## 🚀 Deployment Rápido (TL;DR)

```powershell
# 1. Configurar backend URL en environment.prod.ts
# 2. Build
npm run build

# 3. Subir todo dist/hackaton1/* a public_html/
# 4. Subir .htaccess a public_html/
# 5. Activar SSL en Hostinger
# 6. Abrir https://tudominio.com
```

**¡Listo!** 🎉
