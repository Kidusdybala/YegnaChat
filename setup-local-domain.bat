@echo off
echo Adding yegnachat.local to hosts file...
echo This requires administrator privileges.
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as administrator...
    echo 127.0.0.1 yegnachat.local >> C:\Windows\System32\drivers\etc\hosts
    echo yegnachat.local has been added to your hosts file.
    echo You can now access your app at http://yegnachat.local:5173
    echo.
    echo Press any key to continue...
    pause >nul
) else (
    echo This script needs to be run as administrator.
    echo Please right-click on this file and select "Run as administrator"
    echo.
    echo Press any key to exit...
    pause >nul
)