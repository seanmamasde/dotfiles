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
$baseFolderPath = "C:\Users\seanma\web_drives"
$logFilePath = "C:\Users\seanma\log\rclone\service_status.log"

function Check-ServiceStatus {
    try {
        # Log the start of the check
        $logEntry = "{0}  INFO  rclone service checking started" -f (Get-Date)
        Add-Content -Path $logFilePath -Value $logEntry
        
        for ($i = 0; $i -lt $servicesToMonitor.Count; $i++) {
            $service = $servicesToMonitor[$i]
            $folderName = $folderNames[$i]
            $folderPath = Join-Path -Path $baseFolderPath -ChildPath $folderName
            $serviceStatus = Get-Service -Name $service -ErrorAction SilentlyContinue

            if ($serviceStatus) {
                $status = $serviceStatus.Status
                if ($status -ne "Running") {
                    if (Test-Path -Path $folderPath) {
                        # Remove the folder or shortcut if the service is not running
                        Remove-Item -Path $folderPath -Force
                        
                        # Log the removal action
                        $logEntry = "{0}  WARN  Service Name: {1} | Status: {2} | Removed: {3}" -f (Get-Date), $service, $status, $folderPath
                        Add-Content -Path $logFilePath -Value $logEntry
                        
                        # Attempt to restart the service using NSSM
                        Start-Process -FilePath "nssm" -ArgumentList "start", $service -NoNewWindow -Wait
                    }
                }
            } else {
                # Show a popup window if the service is not found
                $message = "Service $service not found. Please check the service name."
                [System.Windows.Forms.MessageBox]::Show($message, "Service Not Found", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)

                # Log the service not found
                $logEntry = "{0}  ERROR  Service Name: {1}  | Status: not found" -f (Get-Date), $service
                Add-Content -Path $logFilePath -Value $logEntry
            }
        }
    } catch {
        # Log any errors encountered during the check
        $logEntry = "{0}  ERROR  An error occurred: {1}" -f (Get-Date), $_.Exception.Message
        Add-Content -Path $logFilePath -Value $logEntry
    } finally {
        # Log the end of the check
        $logEntry = "{0}  INFO  rclone service checking finished" -f (Get-Date)
        Add-Content -Path $logFilePath -Value $logEntry
    }
}

Add-Type -AssemblyName System.Windows.Forms

Check-ServiceStatus
