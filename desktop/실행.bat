@echo off
cd /d "%~dp0"
call npm start
if errorlevel 1 (
  echo.
  echo ================================
  echo 오류가 발생했어요. 위 메시지를 확인해주세요.
  echo ================================
  pause
)
