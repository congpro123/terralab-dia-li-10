@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Can cai Node.js 22.13 tro len de chay TerraLab.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Chua co thu vien. Hay chay npm ci trong thu muc nay truoc.
  pause
  exit /b 1
)
echo TerraLab: http://127.0.0.1:5173
echo Giu cua so nay mo trong khi su dung. Nhan Ctrl+C de dung.
call npm run dev -- --port 5173
pause
