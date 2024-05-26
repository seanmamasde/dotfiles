$EdgeProfiles = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\Edge\User Data" | Where-Object { $_.Name -like "Profile *"}
 
ForEach($EdgeProfile in $EdgeProfiles.Name) {
 
    # Get Profile Name
    $Preferences = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\$EdgeProfile\Preferences"
    $Data = (ConvertFrom-Json (Get-content $Preferences -Raw))
    $ProfileName = $Data.Profile.Name
 
    # Create Shortcut on Desktop
    $TargetPath =  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    $ShortcutFile = "$env:USERPROFILE\Desktop\Edge - $ProfileName.lnk"
    $WScriptShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WScriptShell.CreateShortcut($ShortcutFile)
    $Shortcut.IconLocation = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\$EdgeProfile\Edge Profile.ico, 0"
    $Shortcut.Arguments =  "--profile-directory=""$EdgeProfile"""
    $Shortcut.TargetPath = $TargetPath
    $Shortcut.Save()
 
}
 
# Get Profile Name
$Preferences = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Preferences"
$Data = (ConvertFrom-Json (Get-content $Preferences -Raw))
$ProfileName = $Data.Profile.Name
 
If($ProfileName -eq "Person 1") {
 
    $ProfileName = "Default"
 
}
 
# Create Shortcut on Desktop
$TargetPath =  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$ShortcutFile = "$env:USERPROFILE\Desktop\Edge - $ProfileName.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutFile)
$Shortcut.IconLocation = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Edge Profile.ico, 0"
$Shortcut.Arguments =  "--profile-directory=""Default"""
$Shortcut.TargetPath = $TargetPath
$Shortcut.Save()
