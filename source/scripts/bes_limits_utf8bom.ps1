# Define the BES executable path using short path
$BESPath = "C:\Program Files\BES - Battle Encoder Shirasé\BES_1.7.8\BES.exe"

# Start BES
& "$BESPath" -m
Start-Sleep -Seconds 10 # Wait for BES to initialize

# Define a list of processes to manage
$ProcessList = @(
    @{ Path = "C:\Windows\System32\SearchProtocolHost.exe"; Limit = 80 },
    @{ Path = "C:\Windows\System32\SearchIndexer.exe"; Limit = 80 },
    @{ Path = "C:\Windows\System32\SearchFilterHost.exe"; Limit = 80 },
    @{ Path = "C:\Users\seanma\Desktop\mactype\mt64agnt.exe"; Limit = 80 }
)

# Loop every 60 seconds
while ($true) {
    # Check if BES.exe is running
    $isRunning = Get-Process | Where-Object { $_.ProcessName -eq "BES" } | Measure-Object
    if ($isRunning.Count -eq 0) {
        & "$BESPath" -m
        Start-Sleep -Seconds 10 # Wait for BES to initialize
    }

    foreach ($process in $ProcessList) {
        if (Test-Path $process.Path) {
            # Apply BES settings for each process
            & "$BESPath" "$($process.Path)" $($process.Limit) --add -m
        }
    }
    # Wait for 60 seconds before repeating
    Start-Sleep -Seconds 60
}

