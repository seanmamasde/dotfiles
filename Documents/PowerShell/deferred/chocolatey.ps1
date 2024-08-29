Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1

$ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
if (Test-Path($ChocolateyProfile)) {
    Import-Module "$ChocolateyProfile"
}

function choco-cleaner {
  Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
  pwsh C:\tools\BCURRAN3\choco-cleaner.ps1
}

