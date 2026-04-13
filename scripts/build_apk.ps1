# Omni Chain APK Build Automation Script
# Usage: .\scripts\build_apk.ps1

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   OMNI CHAIN: ANDROID APK BUILDER" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Production Build of Web Assets
Write-Host "[1/4] Compiling Web Assets (Vite)..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Vite build failed." -ForegroundColor Red
    exit 1
}

# 2. Ensure Android Platform is Added
if (!(Test-Path "android")) {
    Write-Host "[2/4] Adding Android Platform..." -ForegroundColor Yellow
    npx cap add android
} else {
    Write-Host "[2/4] Syncing with Capacitor Android..." -ForegroundColor Yellow
    npx cap sync android
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Capacitor operation failed. Ensure Android Studio is installed." -ForegroundColor Red
    exit 1
}

# 3. Gradle Build (Assemble Debug)
Write-Host "[3/4] Running Gradle Assembler..." -ForegroundColor Yellow
cd android
.\gradlew.bat assembleDebug
cd ..

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Gradle build failed." -ForegroundColor Red
    exit 1
}

# 4. Success Output
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "   BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "   APK: $apkPath" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
} else {
    Write-Host "[ERROR] APK file not found at expected path." -ForegroundColor Red
}
