# two mamba files, destination definition and two files at destination
$psm1 = "C:\Users\seanma\source\scripts\conda_mamba\Mamba.psm1"
$hook = "C:\Users\seanma\source\scripts\conda_mamba\mamba-hook.ps1"
$dest = "C:\Users\seanma\scoop\apps\miniconda3\current\shell\condabin\"
$dest_psm1 = Join-Path -Path $dest -ChildPath "Mamba.psm1"
$dest_hook = Join-Path -Path $dest -ChildPath "mamba-hook.ps1"

# copy the files to the destination
Copy-Item -Path $psm1 -Destination $dest -Force
Copy-Item -Path $hook -Destination $dest -Force

# function for comparing files
function Compare-Files {
  param (
    [string]$file1,
    [string]$file2
  )
  $content1 = Get-Content -Path $file1 -Raw
  $content2 = Get-Content -Path $file2 -Raw

  return $content1 -eq $content2
}

# check if files exist and compare them
if ((Test-Path $dest_psm1) -and (Test-Path $dest_hook)) {
  Write-Host "mamba-hook.ps1 and Mamba.psm1 copied to the destination location." -ForegroundColor Green
  
  $is_same_psm1 = Compare-Files -file1 $psm1 -file2 $dest_psm1
  $is_same_hook = Compare-Files -file1 $hook -file2 $dest_hook

  if ($is_same_psm1 -and $is_same_hook) {
    Write-Host "mamba-hook.ps1 and Mamba.psm1 are identical to the source files." -ForegroundColor Green
  } else {
    Write-Host "Files exist but they are different from the source files." -ForegroundColor Red
  }
} else {
  Write-Host "Failed to copy mamba-hook.ps1 and/or Mamba.psm1 to the destination location." -ForegroundColor Red
}

# run deferred conda init and activate base to install mamba
& "C:\Users\seanma\Documents\PowerShell\deferred\conda.ps1"
& Write-Host "> conda activate base" -ForegroundColor Green
& conda activate base
& Write-Output "conda base env activated"
& Write-Host "`n> conda info -e" -ForegroundColor Green
& conda info -e
& Write-Host "> conda install mamba -y" -ForegroundColor Green
& conda install mamba -y
& Write-Host "mamba installed to conda base env!!" -ForegroundColor Cyan

