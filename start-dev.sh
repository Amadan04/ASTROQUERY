#!/bin/bash

echo "Starting NASA Space Biology Dashboard..."
echo

echo "Starting Flask backend on localhost:5000..."
cd nasa-dashboard-backend-master
python app.py &
BACKEND_PID=$!
cd ..

echo
echo "Starting Vite frontend on localhost:5173..."
npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "Test page: http://localhost:5173/test-connection.html"
echo
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
