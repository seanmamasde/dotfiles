@echo off

REM Log directory
set log_dir=C:\Users\seanma\log\rclone

REM Create log directory if it doesn't exist
if not exist "%log_dir%" (
  mkdir "%log_dir%"
)

REM Rotate logs function
call :rotate_logs "%log_dir%" "seanmamasde01_webdav"
call :rotate_logs "%log_dir%" "seanmamasde02_webdav"
call :rotate_logs "%log_dir%" "seanmamasde03_webdav"

REM Timestamp for log file names
for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set ts=%%i
set timestamp=%ts:~0,8%-%ts:~8,6%

REM Log level (set this variable to control the log level)
set log_level=INFO

REM Mount OneDrive WebDAV drives with rclone and log output
start /B rclone mount seanmamasde01_webdav: X: ^
  --webdav-url=https://6k48q4-my.sharepoint.com/personal/seanmamasde01_seanmamasde_onmicrosoft_com/Documents ^
  --transfers=16 ^
  --buffer-size=64M ^
  --vfs-cache-mode full ^
  --vfs-read-chunk-size=128M ^
  --vfs-read-chunk-size-limit=1G ^
  --dir-cache-time=12h ^
  --volname "seanma01" ^
  --log-file=%log_dir%\seanmamasde01_webdav_%timestamp%.log ^
  --log-level=%log_level% ^
  --exclude "/Attachments/**" ^
  --exclude "/Forms/**"

timeout /t 5 /nobreak > nul

start /B rclone mount seanmamasde02_webdav: Y: ^
  --webdav-url=https://6k48q4-my.sharepoint.com/personal/seanmamasde02_seanmamasde_onmicrosoft_com/Documents ^
  --transfers=16 ^
  --buffer-size=64M ^
  --vfs-cache-mode full ^
  --vfs-read-chunk-size=128M ^
  --vfs-read-chunk-size-limit=1G ^
  --dir-cache-time=12h ^
  --volname "seanma02" ^
  --log-file=%log_dir%\seanmamasde02_webdav_%timestamp%.log ^
  --log-level=%log_level% ^
  --exclude "/Attachments/**" ^
  --exclude "/Forms/**"

timeout /t 5 /nobreak > nul

start /B rclone mount seanmamasde03_webdav: Z: ^
  --webdav-url=https://6k48q4-my.sharepoint.com/personal/seanmamasde03_seanmamasde_onmicrosoft_com/Documents ^
  --transfers=16 ^
  --buffer-size=64M ^
  --vfs-cache-mode full ^
  --vfs-read-chunk-size=128M ^
  --vfs-read-chunk-size-limit=1G ^
  --dir-cache-time=12h ^
  --volname "seanma03" ^
  --log-file=%log_dir%\seanmamasde03_webdav_%timestamp%.log ^
  --log-level=%log_level% ^
  --exclude "/Attachments/**" ^
  --exclude "/Forms/**"

exit /b

:rotate_logs
setlocal
set log_dir=%~1
set log_prefix=%~2
set max_logs=10

for /f "skip=%max_logs% tokens=*" %%a in ('dir /b /o-d "%log_dir%\%log_prefix%*.log"') do del "%log_dir%\%%a"
endlocal
exit /b
