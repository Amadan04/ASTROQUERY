#!/bin/bash
# =============================================================================
# ASTROQUERY - Linux/macOS Setup Script
# =============================================================================

set -e  # Exit on error

echo ""
echo "================================"
echo " ASTROQUERY Setup"
echo "================================"
echo ""

# Check Python installation
echo "[1/6] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/downloads/"
    exit 1
fi
echo "[OK] Python is installed: $(python3 --version)"
echo ""

# Check Node.js installation
echo "[2/6] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js is installed: $(node --version)"
echo ""

# Backend setup
echo "[3/6] Setting up Python backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Download SpaCy model
echo "Downloading SpaCy language model..."
python -m spacy download en_core_web_sm

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "[WARNING] .env file not found"
    echo "Copying from .env.example..."
    cp .env.example .env
    echo ""
    echo "================================"
    echo " IMPORTANT: Configure API Keys"
    echo "================================"
    echo ""
    echo "Please edit backend/.env and add:"
    echo "  - OPENROUTER_API_KEY (get from https://openrouter.ai)"
    echo "  - NCBI_API_KEY (get from https://www.ncbi.nlm.nih.gov/account/)"
    echo ""
fi

cd ..
echo "[OK] Backend setup complete"
echo ""

# Frontend setup
echo "[4/6] Setting up frontend..."
echo "Installing Node.js dependencies..."
npm install
echo "[OK] Frontend setup complete"
echo ""

# Create data directories
echo "[5/6] Creating data directories..."
cd backend
mkdir -p data
cd ..
echo "[OK] Data directories created"
echo ""

echo "[6/6] Setup validation..."
echo ""
echo "================================"
echo " Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit backend/.env and add your API keys"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "4. Open your browser to http://localhost:5173"
echo ""
echo "================================"
echo ""