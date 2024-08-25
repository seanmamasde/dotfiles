# define the base directory
$trimmerLogFile = "C:\\Users\\seanma\\log\\trimmer.log"
$baseLogDirectory = "C:\\Users\\seanma\\log"

# function to process and trim log files
function Trim-LogFiles {
    param (
        [string]$logDirectory,
        [int]$maxLines = 1000
    )

    # recursively get all log files in the directory
    $logFiles = Get-ChildItem -Path $logDirectory -Recurse -File -Filter *.log

    try {
        foreach ($logFile in $logFiles) {
            # read all lines from the log file
            $lines = Get-Content -Path $logFile.FullName

            # check if the log file has more than the maximum allowed lines
            if ($lines.Count -gt $maxLines) {
                # get the last $maxLines lines
                $trimmedLines = $lines[-$maxLines..-1]

                # write back the trimmed lines to the log file
                Set-Content -Path $logFile.FullName -Value $trimmedLines

                # log the action to a separate file
                $logEntry = "{0}  INFO  Trimmed {1} to the last {2} lines" -f (Get-Date), $logFile.FullName, $maxLines
                Add-Content -Path $trimmerLogFile -Value $logEntry
            } else {
                # log the action to a separate file
                $logEntry = "{0}  INFO  Checked {1} is less than {2} lines" -f (Get-Date), $logFile.FullName, $maxLines
                Add-Content -Path $trimmerLogFile -Value $logEntry
            }
        }
    } catch {
        $logEntry = "{0}  ERROR  An error occurred: {1}" -f (Get-Date), $_.Exception.Message
        Add-Content -Path $trimmerLogFile -value $logEntry
    }
} 

Trim-LogFiles -logDirectory $baseLogDirectory
