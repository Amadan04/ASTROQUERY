@echo off
REM =============================================================================
REM ASTROQUERY - Windows Setup Script
REM =============================================================================

echo.
echo ================================
echo  ASTROQUERY Setup
echo ================================
echo.

REM Check Python installation
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python is installed
echo.

REM Check Node.js installation
echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
echo.

REM Backend setup
echo [3/6] Setting up Python backend...
cd nasa-dashboard-backend-master

REM Create virtual environment
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Download SpaCy model
echo Downloading SpaCy language model...
python -m spacy download en_core_web_sm

REM Check for .env file
if not exist .env (
    echo.
    echo [WARNING] .env file not found
    echo Copying from .env.example...
    copy .env.example .env
    echo.
    echo ================================
    echo  IMPORTANT: Configure API Keys
    echo ================================
    echo.
    echo Please edit nasa-dashboard-backend-master\.env and add:
    echo   - OPENROUTER_API_KEY (get from https://openrouter.ai)
    echo   - NCBI_API_KEY (get from https://www.ncbi.nlm.nih.gov/account/)
    echo.
)

cd ..
echo [OK] Backend setup complete
echo.

REM Frontend setup
echo [4/6] Setting up frontend...
echo Installing Node.js dependencies...
call npm install
echo [OK] Frontend setup complete
echo.

echo [5/6] Creating data directories...
cd nasa-dashboard-backend-master
if not exist data mkdir data
cd ..
echo [OK] Data directories created
echo.

echo [6/6] Setup validation...
echo.
echo ================================
echo  Setup Complete!
echo ================================
echo.
echo Next steps:
echo.
echo 1. Edit nasa-dashboard-backend-master\.env and add your API keys
echo.
echo 2. Start the backend (in one terminal):
echo    cd nasa-dashboard-backend-master
echo    venv\Scripts\activate
echo    python app.py
echo.
echo 3. Start the frontend (in another terminal):
echo    npm run dev
echo.
echo 4. Open your browser to http://localhost:5173
echo.
echo ================================
echo.

pause