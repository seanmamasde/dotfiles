$servicesToMonitor = @(
    "rclone_mount_seanmamasde01",
    "rclone_mount_seanmamasde02",
    "rclone_mount_seanmamasde03"
)
$folderNames = @(
    "seanmamasde01",
    "seanmamasde02",
    "seanmamasde03"
)
$baseFolderPath = "C:\Users\seanma\WebDrives"
$logFilePath = "C:\Users\seanma\log\rclone\serviceStatus.log"

function Check-ServiceStatus {
    for ($i = 0; $i -lt $servicesToMonitor.Count; $i++) {
        $service = $servicesToMonitor[$i]
        $folderName = $folderNames[$i]
        $serviceStatus = Get-Service -Name $service -ErrorAction SilentlyContinue
        $folderPath = Join-Path -Path $baseFolderPath -ChildPath $folderName

        if ($serviceStatus) {
            $status = $serviceStatus.Status
            if ($status -ne "Running") {
                if (Test-Path -Path $folderPath) {
                    # Remove the folder or shortcut if the service is not running
                    Remove-Item -Path $folderPath -force
                    # Log the removal action
                    $logEntry = "{0} - {1}: {2} (Removed {3})" -f (Get-Date), $service, $status, $folderPath
                    Add-Content -Path $logFilePath -Value $logEntry
                    # Attempt to restart the service using NSSM
                    Start-Process -FilePath "nssm" -ArgumentList "start", $service -NoNewWindow -Wait
                }
            }
        } else {
            # Show a popup window if the service is not found
            $message = "Service $service not found. Please check the service name."
            [System.Windows.Forms.MessageBox]::Show($message, "Service Not Found", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
        }
    }
}

Add-Type -AssemblyName System.Windows.Forms

Check-ServiceStatus
