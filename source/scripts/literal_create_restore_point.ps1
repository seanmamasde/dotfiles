function Create-RestorePoint {
    $restorePointName = "Automatic Restore Point - $(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Checkpoint-Computer -Description $restorePointName -RestorePointType "MODIFY_SETTINGS"
}

# Create a restore point on system boot
Create-RestorePoint

# Create a daily restore point
while ($true) {
    # Get the current date
    $today = Get-Date -Format "yyyy-MM-dd"

    # Get the time to run the task every day
    $runTime = Get-Date "$today 02:00AM"  # Adjust the time as needed

    # If the current time is past the run time, adjust the run time to the next day
    if ((Get-Date) -ge $runTime) {
        $runTime = $runTime.AddDays(1)
    }

    # Calculate the time until the next scheduled run
    $timeUntilRun = $runTime - (Get-Date)

    # Sleep until the scheduled time
    Start-Sleep -Seconds $timeUntilRun.TotalSeconds

    # Wake up the system if it's asleep (not hibernating)
    $wmiQuery = "Select * From Win32_PowerManagementEvent"
    Register-WmiEvent -Query $wmiQuery -SourceIdentifier "WakeupEvent" -Action {
        # Log a message to the event log for debugging
        Write-EventLog -LogName "Application" -Source "CreateRestorePoint" -EntryType Information -EventId 1001 -Message "Waking up to create a restore point."

        # Call the function to create a restore point
        Create-RestorePoint
    }
}
