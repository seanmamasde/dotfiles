$unisonDir = "C:\\Users\\seanma\\.unison"
$logFile = Join-Path -Path $unisonDir -ChildPath "unison.log"

$unisonTaskLogFile = "C:\\Users\\seanma\\log\\unison_task.log"

function Trim-Log {
    param (
        [int]$maxLines = 10000
    )

    try {
        $lines = Get-Content -Path $logFile

        if ($lines.Count -gt $maxLines) {
            $trimmedLines = $lines[-$maxLines..-1]
            Set-Content -Path $logFile.FullName -Value $trimmedLines
            $logEntry = "{0}  INFO  Trimmed {1} to the last {2} lines" -f (Get-Date), $logFile, $maxLines
            Add-Content -Path $unisonTaskLogFile -Value $logEntry
        } else {
            $logEntry = "{0}  INFO  Checked {1} is less than {2} lines" -f (Get-Date), $logFile, $maxLines
            Add-Content -Path $unisonTaskLogFile -Value $logEntry
        }
    } catch {
        $logEntry = "{0}  ERROR  An error occurred: {1}" -f (Get-Date), $_.Exception.Message
        Add-Content -Path $unisonTaskLogFile -Value $logEntry
    }
}

function Clean-Cache {
    $cacheFiles = Get-ChildItem -Path $unisonDir -File

    $logBegin = "{0}  INFO  Begin checking {1} for cache files" -f (Get-Date), $unisonDir
    Add-Content -Path $unisonTaskLogFile -Value $logBegin

    try {
        foreach ($file in $cacheFiles) {
            if ([string]::IsNullOrEmpty($file.Extension)) {
                $logEntry = "{0}  INFO  Removed cache file {1}" -f (Get-Date), $file.FullName
                Add-Content -Path $unisonTaskLogFile -Value $logEntry

                Remove-Item -Path $file.FullName -Force
            } else {
                $logEntry = "{0}  INFO  Ignoring non-cache file {1}" -f (Get-Date), $file.FullName
                Add-Content -Path $unisonTaskLogFile -Value $logEntry
            }
        }
    } catch {
        $logEntry = "{0}  ERROR  An error occurred: {1}" -f (Get-Date), $_.Exception.Message
        Add-Content -Path $unisonTaskLogFile -Value $logEntry
    }

    $logEnd = "{0}  INFO  Ended checking {1} for cache files" -f (Get-Date), $unisonDir
    Add-Content -Path $unisonTaskLogFile -Value $logEnd
}

Trim-Log
Clean-Cache
