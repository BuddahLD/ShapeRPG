#!/bin/bash

# Find process on port 5000
PORT=3000
PIDS=$(lsof -ti:$PORT)

if [ -n "$PIDS" ]; then
  echo "⚠️  Found process running on port $PORT. Killing it..."
  echo "$PIDS" | xargs kill -9
  
  # Wait until the port is actually free
  while lsof -ti:$PORT >/dev/null; do
    echo "⏳ Waiting for port $PORT to clear..."
    sleep 0.5
  done
  
  echo "✅ Port $PORT is now free."
else
  echo "✅ Port $PORT is free."
fi

# Wait for server to be ready in background, then open Chrome
(
  echo "⏳ Waiting for server to start..."
  until lsof -ti:$PORT >/dev/null; do
    sleep 0.5
  done
  echo "🎉 Server is up! Opening Chrome..."
  open -a "Google Chrome" "http://localhost:$PORT"
) &

echo "🚀 Starting ShapeRPG..."
npm run dev
