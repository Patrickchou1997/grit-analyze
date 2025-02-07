@echo off
SETLOCAL

:: Check if Docker is installed
docker --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed. Installing...
    start /wait https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
    echo Please install Docker, restart your computer, and run setup.bat again.
    exit /b
) ELSE (
    echo Docker is already installed.
)

:: Run Docker Compose
echo Stopping and removing existing containers...
docker-compose down -v

echo Building and starting new containers...
docker-compose up --build -d

echo Setup completed successfully!
ENDLOCAL
exit
