@echo off
setlocal enabledelayedexpansion

:: Force working directory to the project root
cd /d "%~dp0"

echo =======================================================
echo    NexFix Financial OS - Android APK Build Pipeline
echo =======================================================
echo  Workspace Directory: %CD%
echo.

set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.102-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/3] Building Next.js Web App...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Next.js production build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Syncing Web Assets to Android project...
call npx cap copy android
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Capacitor asset copy failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Checking Android SDK environment...
set ANDROID_SDK_PATH=%LOCALAPPDATA%\Android\Sdk
if not exist "%ANDROID_SDK_PATH%" (
    echo.
    echo -----------------------------------------------------------------
    echo [NOTICE] Android SDK not detected at:
    echo   %ANDROID_SDK_PATH%
    echo.
    echo To build locally on your PC, install Android Studio:
    echo   https://developer.android.com/studio
    echo.
    echo Alternatively, download the pre-built APK from your GitHub Actions:
    echo   https://github.com/aravindh1-stack/AarFin-Nest/actions
    echo -----------------------------------------------------------------
    echo.
    pause
    exit /b 0
)

echo Compiling Android APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo.
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
echo  %CD%\android\app\build\outputs\apk\debug\app-debug.apk
echo =======================================================
echo.
pause
