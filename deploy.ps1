# Script de deployment para Hostinger
# Ejecutar: .\deploy.ps1

Write-Host "🚀 INICIANDO DEPLOYMENT PARA HOSTINGER" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Paso 2: Verificar configuración de producción
Write-Host "📝 Verificando configuración de producción..." -ForegroundColor Yellow

$envFile = "src\environments\environment.prod.ts"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    if ($content -match "tu-dominio-hostinger.com") {
        Write-Host "⚠️  ADVERTENCIA: Aún tienes 'tu-dominio-hostinger.com' en environment.prod.ts" -ForegroundColor Yellow
        Write-Host "   Por favor, actualiza las URLs antes de continuar." -ForegroundColor Yellow
        $continue = Read-Host "¿Continuar de todos modos? (s/n)"
        if ($continue -ne "s") {
            exit 0
        }
    }
    Write-Host "✅ Archivo de entorno encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Error: No se encontró environment.prod.ts" -ForegroundColor Red
    exit 1
}

# Paso 3: Limpiar build anterior
Write-Host ""
Write-Host "🧹 Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Build anterior eliminado" -ForegroundColor Green
}

# Paso 4: Ejecutar build de producción
Write-Host ""
Write-Host "🏗️  Compilando proyecto para producción..." -ForegroundColor Yellow
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en la compilación" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Compilación exitosa" -ForegroundColor Green

# Paso 5: Verificar archivos generados
Write-Host ""
Write-Host "📦 Verificando archivos generados..." -ForegroundColor Yellow

$distPath = "dist\hackaton1"
if (-not (Test-Path $distPath)) {
    Write-Host "❌ Error: No se encontró la carpeta dist/hackaton1" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem $distPath
Write-Host "   Archivos generados: $($files.Count)" -ForegroundColor Cyan

# Verificar archivos críticos
$criticalFiles = @("index.html", "main-*.js", "styles-*.css")
foreach ($pattern in $criticalFiles) {
    $found = Get-ChildItem $distPath -Filter $pattern.Replace("*", "*") -ErrorAction SilentlyContinue
    if ($found) {
        Write-Host "   ✅ $pattern encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $pattern no encontrado" -ForegroundColor Yellow
    }
}

# Paso 6: Copiar .htaccess
Write-Host ""
Write-Host "📋 Copiando .htaccess..." -ForegroundColor Yellow

if (Test-Path ".htaccess") {
    Copy-Item ".htaccess" -Destination $distPath
    Write-Host "✅ .htaccess copiado" -ForegroundColor Green
} else {
    Write-Host "⚠️  .htaccess no encontrado en la raíz" -ForegroundColor Yellow
}

# Paso 7: Crear archivo ZIP para subir
Write-Host ""
Write-Host "📦 Creando archivo ZIP para deployment..." -ForegroundColor Yellow

$zipPath = "dist\hackaton1-deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$distPath\*" -DestinationPath $zipPath

if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host "✅ ZIP creado: hackaton1-deploy.zip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ Error al crear ZIP" -ForegroundColor Red
}

# Paso 8: Mostrar instrucciones finales
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT PREPARADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Archivos listos en: $distPath" -ForegroundColor Cyan
Write-Host "📦 ZIP para subir: $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ir a Hostinger File Manager:" -ForegroundColor White
Write-Host "   https://hpanel.hostinger.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Navegar a public_html/" -ForegroundColor White
Write-Host ""
Write-Host "3. Subir y extraer: $zipPath" -ForegroundColor White
Write-Host "   O subir archivos de: $distPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Verificar que .htaccess esté en la raíz" -ForegroundColor White
Write-Host ""
Write-Host "5. Activar SSL en Hostinger (Security > SSL)" -ForegroundColor White
Write-Host ""
Write-Host "6. Abrir tu sitio: https://tudominio.com" -ForegroundColor White
Write-Host ""
Write-Host "📖 Ver guía completa: DEPLOY_HOSTINGER.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "¡Listo para deployment! 🎉" -ForegroundColor Green
