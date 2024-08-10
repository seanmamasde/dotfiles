# rotating logs
function rotate-logs {
  param(
    [string]$log_dir,
    [string]$log_prefix,
    [int]$max_logs=10
  )

  $logs = Get-ChildItem -Path $log_dir -Filter "$log_prefix*.log" | Sort-Object LastWriteTime

  if ($logs.Count -gt $max_logs) {
    $logs_to_remove = $logs | Select-Object -First ($logs.Count - $max_logs)
    foreach ($log in $logs_to_remove) {
      Remove-Item -Path $log.FullName
    }
  }
}

# log directory
$log_dir = "C:/Users/seanma/log/rclone"

if (-not (Test-Path $log_dir)) {
  New-Item -ItemType Directory -Path $log_dir
}

# rotating logs
rotate-logs -log_dir $log_dir -log_prefix "seanmamasde01_webdav"
rotate-logs -log_dir $log_dir -log_prefix "seanmamasde02_webdav"
rotate-logs -log_dir $log_dir -log_prefix "seanmamasde03_webdav"

# timestamp to create new log file
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# mount onedrives
Start-Process "rclone" -ArgumentList "mount seanmamasde01_webdav: X: --webdav-url=https://6k48q4-my.sharepoint.com/personal/seanmamasde01_seanmamasde_onmicrosoft_com/Documents --transfers=16 --buffer-size=64M --vfs-cache-mode full --vfs-read-chunk-size=128M --vfs-read-chunk-size-limit=1G --dir-cache-time=12h --volname 'seanma01' --log-file=$logDir/seanmamasde01_webdav_$timestamp.log --log-level=DEBUG" -WindowStyle Hidden
Start-Process "rclone" -ArgumentList "mount seanmamasde02_webdav: Y: --webdav-url=https://6k48q4-my.sharepoint.com/personal/seanmamasde02_seanmamasde_onmicrosoft_com/Documents --transfers=16 --buffer-size=64M --vfs-cache-mode full --vfs-read-chunk-size=128M --vfs-read-chunk-size-limit=1G --dir-cache-time=12h --volname 'seanma02' --log-file=$logDir/seanmamasde02_webdav_$timestamp.log --log-level=DEBUG" -WindowStyle Hidden
Start-Process "rclone" -ArgumentList "mount seanmamasde03_webdav: Z: --webdav-url=https://6k48q4-my.sharepoint.com/personal/seanmamasde03_seanmamasde_onmicrosoft_com/Documents --transfers=16 --buffer-size=64M --vfs-cache-mode full --vfs-read-chunk-size=128M --vfs-read-chunk-size-limit=1G --dir-cache-time=12h --volname 'seanma03' --log-file=$logDir/seanmamasde03_webdav_$timestamp.log --log-level=DEBUG" -WindowStyle Hidden
