@echo off
title Trackmania Game Server
cd /d "C:\Users\aniss\lptf\projets\Mini vibes\Mini-Vibes"
echo.
echo ==========================================
echo    TRACKMANIA THREE.JS - Game Server
echo ==========================================
echo.
echo Server starting on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
pause
