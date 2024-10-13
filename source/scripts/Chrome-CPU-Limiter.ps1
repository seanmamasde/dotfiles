# CPU limit percentage
$cpuLimitPercent = 10
$cpuRate = $cpuLimitPercent * 100

# Create Job Object
$jobName = "Chrome-CPU-Limiter"
$jobHandle = [System.Runtime.InteropServices.Marshal]::GetIUnknownForObject([System.Runtime.InteropServices.Marshal]::GetObjectForIUnknown([System.Diagnostics.Process]::GetCurrentProcess().Handle))

$JOB_HANDLE_LIMIT_WORKINGSET = 0x00000001
$JOB_OBJECT_LIMIT_PROCESS_TIME = 0x00000002
$JOB_OBJECT_LIMIT_JOB_TIME = 0x00000004
$JOB_OBJECT_LIMIT_ACTIVE_PROCESS = 0x00000008
$JOB_OBJECT_LIMIT_AFFINITY = 0x00000010
$JOB_OBJECT_LIMIT_PRIORITY_CLASS = 0x00000020
$JOB_OBJECT_LIMIT_PRESERVE_JOB_TIME = 0x00000040
$JOB_OBJECT_LIMIT_SCHEDULING_CLASS = 0x00000080
$JOB_OBJECT_LIMIT_PROCESS_MEMORY = 0x00000100
$JOB_OBJECT_LIMIT_JOB_MEMORY = 0x00000200
$JOB_OBJECT_LIMIT_DIE_ON_UNHANDLED_EXCEPTION = 0x00000400
$JOB_OBJECT_LIMIT_BREAKAWAY_OK = 0x00000800
$JOB_OBJECT_LIMIT_SILENT_BREAKAWAY_OK = 0x00001000
$JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x00002000
$JOB_OBJECT_LIMIT_SUBSET_AFFINITY = 0x00004000
$JOB_OBJECT_LIMIT_JOB_MEMORY_HIGH = 0x00000200

$flags = $JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE

# Create the Job Object
$job = New-Object System.Management.JobObject($jobName)

# Set CPU limit
$cpuInfo = New-Object System.Management.JobObjectCpuRateControlInformation
$cpuInfo.ControlFlags = 0x1 -bor 0x4  # JOB_OBJECT_CPU_RATE_CONTROL_ENABLE | JOB_OBJECT_CPU_RATE_CONTROL_HARD_CAP
$cpuInfo.CpuRate = $cpuRate

$job.SetCpuRateControlInformation($cpuInfo)

# Assign all running chrome.exe processes to the job
Get-Process chrome | ForEach-Object {
    $job.AddProcess($_)
}

# Monitor and add new chrome.exe processes
Register-WmiEvent -Query "SELECT * FROM __InstanceCreationEvent WITHIN 5 WHERETargetInstance ISA 'Win32_Process' AND TargetInstance.Name='chrome.exe'" -Action {
    $newProcess = Get-Process -Id $Event.SourceEventArgs.NewEvent.TargetInstance.ProcessId
    $job.AddProcess($newProcess)
}

