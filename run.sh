#!/usr/bin/env bash
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting the app on http://127.0.0.1:5173/"
npm start
