@echo off
echo =======================================================
echo    NexFix Financial OS - Android APK Build Pipeline
echo =======================================================
echo.

set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.102-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/3] Building Next.js Web App...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Next.js production build failed.
    pause
    exit /b %errorlevel%
)

echo [2/3] Syncing Web Assets to Android project...
call npx cap copy android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor asset copy failed.
    pause
    exit /b %errorlevel%
)

echo [3/3] Compiling Android APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [ERROR] Gradle compilation failed.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo =======================================================
echo  SUCCESS! Android APK built successfully.
echo.
echo  APK Location:
echo  D:\Hub\Innovations\AarFin-Nest\android\app\build\outputs\apk\debug\app-debug.apk
echo =======================================================
pause
