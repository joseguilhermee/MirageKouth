@echo off
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    py decrypt_gui.py
) else (
    python decrypt_gui.py
)

if errorlevel 1 (
    echo.
    echo Algo deu errado ao abrir o Decifrador. Veja o erro acima.
    pause
)
