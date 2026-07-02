#!/bin/bash

echo "===================================="
echo " Neverwinter - Text Adventure"
echo "===================================="
echo ""
echo "Starting local server..."
echo ""
echo "The game will be available at:"
echo "http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "===================================="
echo ""

python3 -m http.server 8000
