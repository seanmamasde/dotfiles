# Define paths
$cachePath = "$HOME/.cache/micro"
$logPath = "$HOME/log/micro.log"

# Ensure log directory exists
if (-not (Test-Path "$HOME/log")) {
    New-Item -ItemType Directory -Path "$HOME/log"
}

# Function to log messages
function Log-Info {
    param (
        [string]$message
    )
    $timestamp = (Get-Date).ToString("dd-MMM-yy HH:mm:ss")
    $logMessage = "$timestamp  INFO  $message"
    Add-Content -Path $logPath -Value $logMessage
}

Log-Info "Started checking empty folder in ~/.cache/micro/"

$containsFolders = $false

# Check for empty folders
Get-ChildItem -Path $cachePath -Directory | ForEach-Object {
    $containsFolders = $true
    $folder = $_.FullName
    $timestamp = $_.Name
    $files = Get-ChildItem -Path $folder

    if ($files.Count -eq 0) {
        # If folder is empty, remove it and log
        Remove-Item -Path $folder -Recurse
        Log-Info "Folder `"$timestamp`" has no files in it, removed."
    } else {
        # Log that folder has files and is kept
        Log-Info "Folder `"$timestamp`" has $($files.Count) files in it, kept."
    }
}

if (-not $containsFolders) {
    Log-Info "No folders found in $cachePath."
}

