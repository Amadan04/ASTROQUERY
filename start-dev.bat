@echo off
echo Starting NASA Space Biology Dashboard...
echo.

echo Starting Flask backend on localhost:5000...
cd nasa-dashboard-backend-master
start "Flask Backend" cmd /k "python app.py"
cd ..

echo.
echo Starting Vite frontend on localhost:5173...
start "Vite Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Test page: http://localhost:5173/test-connection.html
echo.
pause
