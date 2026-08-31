@echo off
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    set "PY=py"
) else (
    set "PY=python"
)

%PY% -c "import customtkinter" >nul 2>nul
if not %errorlevel%==0 (
    echo Instalando dependencias pela primeira vez, aguarde...
    %PY% -m pip install -r requirements.txt >nul 2>nul
)

%PY% decrypt_gui.py

if errorlevel 1 (
    echo.
    echo Algo deu errado ao abrir o Decifrador. Veja o erro acima.
    pause
)
