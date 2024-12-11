# Define global variable for PowerShell major version
$global:psMajorVersion = $PSVersionTable.PSVersion.Major

# No deferred loading for PowerShell 5.1
. "$HOME\Documents\DeferredPSModules\conda.ps1"
. "$HOME\Documents\DeferredPSModules\custom_commands.ps1"
. "$HOME\Documents\DeferredPSModules\custom_variables.ps1"
. "$HOME\Documents\DeferredPSModules\gibo_completion.ps1"
. "$HOME\Documents\DeferredPSModules\lazy_functions.ps1"
. "$HOME\Documents\DeferredPSModules\lazy_modules.ps1"
. "$HOME\Documents\DeferredPSModules\psreadline.ps1"
. "$HOME\Documents\DeferredPSModules\scoop.ps1"

##########################
#### Original Profile ####
##########################
# wouldn't work if it's in deferred_dir/chocolatey.ps1
Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1

# 24-bit color not restored after exiting vim in windows
# https://github.com/vim/vim/issues/5092
if ($PSVersionTable.OS -like '*Windows*' -and $host.UI.SupportsVirtualTerminal) {
  function vim {
    Write-Host "`e[?1049h"
    vim.exe @args
    Write-Host "`e[?1049l"
  }
}

# starship
# if ($env:TERM_PROGRAM -ne 'vscode') {
$ENV:STARSHIP_CONFIG = "$HOME\.config\starship.toml"
Invoke-Expression (&starship init powershell)
# }

# zoxide
Invoke-Expression (& { (zoxide init powershell | Out-String) })

# Aliases
Set-Alias grep findstr
Set-Alias open explorer
Set-Alias -Name which -Value 'C:\Windows\system32\where.exe'
Set-Alias trash Remove-ItemSafely
# Remove-Alias is Remove-Item Alias:aliasname in PowerShell 5.1
Remove-Item Alias:diff -Force
Set-Alias diff delta
# Set-Alias tere Invoke-Tere # tere cannot be excluded from the path

# ov pager
ov --completion powershell completion powershell | Out-String | Invoke-Expression

# eza and ripgrep
Remove-Item Alias:ls
Set-Alias ls eza
function ll { ls -la --color=always $args }
function tree { ls --tree -da $args }
function rgf { rg --files | rg $args }

# utilities
function touch {
  $file = $args[0]
  if($null -eq $file) { Write-Host "No filename supplied" }
  else {
    if(Test-Path $file) { (Get-ChildItem $file).LastWriteTime = Get-Date }
    else { Write-Output $null > $file }
  }
}
function source { . $args[0] }
function path { $Env:Path.Split(';') }

# try { $null = gcm pshazz -ea stop; pshazz init 'default' } catch { }

# Import the Chocolatey Profile that contains the necessary code to enable
# tab-completions to function for `choco`.
# Be aware that if you are missing these lines from your profile, tab completion
# for `choco` will not function.
# See https://ch0.co/tab-completion for details.
$ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
if (Test-Path($ChocolateyProfile)) {
  Import-Module "$ChocolateyProfile"
}
