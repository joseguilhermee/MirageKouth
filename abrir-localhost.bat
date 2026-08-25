@echo off
cd /d "%~dp0web"
start "dev-server" cmd /c "npm run dev"
start "" "http://localhost:3000"
