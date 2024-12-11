Import-Module posh-git
Import-Module Recycle
Import-Module gsudoModule
# Import-Module Terminal-Icons # impacts startup performance heavily

Import-Module PSFzf
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+f' -PSReadlineChordReverseHistory 'Ctrl+r'

# Modules that won't run in PowerShell 5.1
if ($psMajorVersion -ge 6) {
    Import-Module "C:\Users\seanma\AppData\Local\PowerToys\WinUI3Apps\..\WinGetCommandNotFound.psd1"
    Import-Module .\PowerShell-Beautifier.psd1
}

# Modules that only run in PowerShell 5.1
if ($psMajorVersion -le 6) {
    Import-Module NTObjectManager
    Import-Module ps2exe
}

