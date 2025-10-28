# 🚀 Instrucciones de Deployment para TCI en Hostinger

## 📋 Información de tu Hosting

- **URL**: https://blueviolet-turkey-560833.hostingersite.com/
- **Carpeta**: public_html
- **Estado**: ✅ Listo para deployment

---

## ✅ ARCHIVOS PREPARADOS

### 📦 Opción 1: Subir archivo ZIP (Más rápido)
**Archivo**: `dist/tci-hostinger.zip` (0.28 MB)

### 📁 Opción 2: Subir carpeta completa
**Carpeta**: `dist/hackaton1/` (todos los archivos)

---

## 🎯 PASOS PARA DEPLOYMENT

### 1️⃣ Acceder a Hostinger File Manager

1. Ir a: https://hpanel.hostinger.com
2. Login con tu cuenta
3. En el panel, buscar tu sitio: **blueviolet-turkey-560833.hostingersite.com**
4. Click en **"Manage"** o **"Administrar"**
5. Click en **"Files"** → **"File Manager"**

---

### 2️⃣ Limpiar public_html (Primera vez)

1. Navegar a la carpeta: `/public_html`
2. **Eliminar** todos los archivos existentes:
   - Seleccionar todos (checkbox arriba)
   - Click en "Delete" o "Eliminar"
   - Confirmar

⚠️ **Nota**: Si hay un archivo `index.html` o carpeta de WordPress, eliminarlos.

---

### 3️⃣ Subir Archivos

#### Opción A: Usando el ZIP (Recomendado)

1. En File Manager, estar en `/public_html`
2. Click en **"Upload Files"** o **"Subir archivos"**
3. Seleccionar el archivo: `D:\ohshit\hackaton1\dist\tci-hostinger.zip`
4. Esperar a que suba (0.28 MB - toma ~5 segundos)
5. Click derecho en `tci-hostinger.zip`
6. Seleccionar **"Extract"** o **"Extraer"**
7. Confirmar extracción
8. **Eliminar** el archivo `tci-hostinger.zip` (ya no se necesita)

#### Opción B: Subir carpeta completa

1. En File Manager, estar en `/public_html`
2. Click en **"Upload Files"**
3. Seleccionar **TODOS** los archivos de `D:\ohshit\hackaton1\dist\hackaton1\`
4. Esperar a que suban todos

---

### 4️⃣ Verificar Archivos

Después de subir, tu carpeta `/public_html` debe tener:

```
/public_html/
├── .htaccess              ← IMPORTANTE (rewrite rules)
├── index.html             ← Entry point
├── favicon.ico
├── styles-77M72P4M.css
├── main-UW7VVO2G.js
├── polyfills-5CFQRCPP.js
├── chunk-26OGNLBW.js
├── chunk-*.js             ← Varios chunks
└── (otros archivos)
```

**Verificación crítica**:
- ✅ `.htaccess` existe (si no aparece, activa "Show Hidden Files")
- ✅ `index.html` existe
- ✅ Archivos JS y CSS están presentes

---

### 5️⃣ Activar SSL (HTTPS)

1. En el panel de Hostinger, ir a **"Security"** o **"Seguridad"**
2. Click en **"SSL"**
3. Buscar tu sitio: **blueviolet-turkey-560833.hostingersite.com**
4. Click en **"Get SSL"** o **"Obtener SSL"** (gratis con Let's Encrypt)
5. Esperar 1-5 minutos a que se active
6. Una vez activo, marcar **"Force HTTPS"** (forzar HTTPS)

---

### 6️⃣ Probar la Aplicación

Abrir en el navegador:
```
https://blueviolet-turkey-560833.hostingersite.com/
```

#### ✅ Verificaciones

1. **Página de bienvenida carga**:
   - Debería ver el splash de TCI con las opciones Pasajero/Conductor

2. **Probar navegación**:
   - Click en "Soy Pasajero" → Debería ir a `/passenger/welcome`
   - Click en "Soy Conductor" → Debería ir a `/driver/welcome`
   - Las rutas NO deben dar error 404 (gracias a `.htaccess`)

3. **Abrir DevTools** (F12):
   - Tab "Console"
   - ⚠️ Esperado: Error de conexión al backend (normal, backend no está listo)
   - ✅ No debería haber errores 404 de archivos JS/CSS

4. **Probar login demo**:
   - Ir a Login Pasajero
   - Intentar login con DNI: 12345678, Password: demo123
   - ⚠️ Esperado: Error porque no hay backend
   - ✅ La interfaz debe responder correctamente

---

## 🐛 Solución de Problemas

### Problema: Error 404 en rutas
**Síntoma**: Al navegar a `/passenger/login` aparece "404 Not Found"

**Solución**:
1. Verificar que `.htaccess` existe en `/public_html/`
2. Si no aparece, activar "Show Hidden Files" en File Manager
3. Si no existe, subirlo manualmente desde `D:\ohshit\hackaton1\.htaccess`

---

### Problema: Página en blanco
**Síntoma**: Solo aparece pantalla blanca

**Solución**:
1. Abrir DevTools (F12) → Console
2. Buscar errores rojos
3. Si dice "Failed to load module", verificar que todos los archivos JS están en `/public_html/`
4. Limpiar caché del navegador: Ctrl + Shift + R

---

### Problema: SSL no se activa
**Síntoma**: Certificado no se genera

**Solución**:
1. Esperar 10-15 minutos (a veces tarda)
2. Contactar soporte de Hostinger (chat 24/7)
3. Mientras tanto, usar HTTP (pero no recomendado)

---

### Problema: Archivos no se extraen del ZIP
**Síntoma**: Al extraer ZIP, no aparecen archivos

**Solución**:
1. Eliminar el ZIP
2. Usar Opción B: Subir archivos uno por uno
3. O usar FTP (FileZilla) para subir

---

## 🔄 Backend (Siguiente Paso)

Tu frontend está configurado para conectarse a:
- **API REST**: `https://blueviolet-turkey-560833.hostingersite.com/api`
- **WebSocket**: `https://blueviolet-turkey-560833.hostingersite.com/ws`

**Opciones para el backend**:

### Opción A: Backend en mismo Hostinger
Si Hostinger soporta Java/Spring Boot:
1. Crear carpeta `/api` en tu hosting
2. Desplegar Spring Boot JAR
3. Configurar Nginx/Apache reverse proxy

### Opción B: Backend en servidor separado (Recomendado)
1. Desplegar Spring Boot en VPS, Railway, Heroku, etc.
2. Actualizar `environment.prod.ts` con la nueva URL del backend
3. Rebuild y re-deploy frontend

**Ver**: `BACKEND_SPEC.md` para especificaciones completas del backend

---

## 📊 Estado Actual

### ✅ Frontend
- [x] Compilado para producción
- [x] URL de Hostinger configurada
- [x] .htaccess incluido
- [x] ZIP creado (0.28 MB)
- [ ] **Subir a Hostinger** ← SIGUIENTE PASO

### ⏳ Backend
- [ ] Crear proyecto Spring Boot
- [ ] Implementar endpoints REST
- [ ] Configurar WebSocket STOMP
- [ ] Deploy backend
- [ ] Actualizar CORS

---

## 🎯 Checklist de Deployment

- [ ] 1. Login a Hostinger File Manager
- [ ] 2. Limpiar `/public_html/`
- [ ] 3. Subir `tci-hostinger.zip`
- [ ] 4. Extraer ZIP
- [ ] 5. Verificar `.htaccess` existe
- [ ] 6. Activar SSL
- [ ] 7. Forzar HTTPS
- [ ] 8. Probar en navegador: https://blueviolet-turkey-560833.hostingersite.com/
- [ ] 9. Verificar navegación funciona
- [ ] 10. Preparar backend Spring Boot

---

## 📞 Soporte

**Hostinger**:
- Panel: https://hpanel.hostinger.com
- Chat 24/7: Botón de chat en el panel
- Tutoriales: https://www.hostinger.com/tutorials

**Archivos del proyecto**:
- `BACKEND_SPEC.md` - Especificación del backend
- `MIGRATION_NOTES.md` - Notas de migración
- `DEPLOY_HOSTINGER.md` - Guía general de deployment

---

## 🚀 ¡Listo para Deployment!

**Archivo para subir**: `D:\ohshit\hackaton1\dist\tci-hostinger.zip` (0.28 MB)

**URL final**: https://blueviolet-turkey-560833.hostingersite.com/

¡Sube los archivos y prueba tu aplicación! 🎉
