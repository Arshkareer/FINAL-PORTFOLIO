@echo off
echo ========================================
echo   ARSHDEEP SINGH - PORTFOLIO SERVER
echo ========================================
echo.
echo Starting server...
echo Your portfolio will be available at:
echo http://localhost:8000/portfolio.html
echo.
echo Opening browser...
start http://localhost:8000/portfolio.html
echo.
echo Server is running...
echo Press Ctrl+C to stop the server
echo ========================================
echo.
python -m http.server 8000
