# Define global variable for PowerShell major version
$global:psMajorVersion = $PSVersionTable.PSVersion.Major

# deferred loading to improve performance
# https://fsackur.github.io/2023/11/20/Deferred-profile-loading-for-better-performance/
$Deferred = {
  . "$HOME\Documents\DeferredPSModules\conda.ps1"
  . "$HOME\Documents\DeferredPSModules\custom_commands.ps1"
  . "$HOME\Documents\DeferredPSModules\custom_variables.ps1"
  . "$HOME\Documents\DeferredPSModules\gibo_completion.ps1"
  . "$HOME\Documents\DeferredPSModules\lazy_functions.ps1"
  . "$HOME\Documents\DeferredPSModules\lazy_modules.ps1"
  . "$HOME\Documents\DeferredPSModules\psreadline.ps1"
  . "$HOME\Documents\DeferredPSModules\scoop.ps1"
}

# https://seeminglyscience.github.io/powershell/2017/09/30/invocation-operators-states-and-scopes
$GlobalState = [psmoduleinfo]::new($false)
$GlobalState.SessionState = $ExecutionContext.SessionState

# to run code asynchronously
$Runspace = [runspacefactory]::CreateRunspace($Host)
$Powershell = [powershell]::Create($Runspace)
$Runspace.Open()
$Runspace.SessionStateProxy.PSVariable.Set('GlobalState', $GlobalState)

# ArgumentCompleters are set on the ExecutionContext, not the SessionState
# Note that $ExecutionContext is not an ExecutionContext, it's an EngineIntrinsics 😡
$Private = [Reflection.BindingFlags]'Instance, NonPublic'
$ContextField = [Management.Automation.EngineIntrinsics].GetField('_context', $Private)
$Context = $ContextField.GetValue($ExecutionContext)

# Get the ArgumentCompleters. If null, initialize them.
$ContextCACProperty = $Context.GetType().GetProperty('CustomArgumentCompleters', $Private)
$ContextNACProperty = $Context.GetType().GetProperty('NativeArgumentCompleters', $Private)
$CAC = $ContextCACProperty.GetValue($Context)
$NAC = $ContextNACProperty.GetValue($Context)
if ($null -eq $CAC) {
  $CAC = [Collections.Generic.Dictionary[string, scriptblock]]::new()
  $ContextCACProperty.SetValue($Context, $CAC)
}
if ($null -eq $NAC) {
  $NAC = [Collections.Generic.Dictionary[string, scriptblock]]::new()
  $ContextNACProperty.SetValue($Context, $NAC)
}

# get the AutomationEngine and ExecutionContext of the runspace
$RSEngineField = $Runspace.GetType().GetField('_engine', $Private)
$RSEngine = $RSEngineField.GetValue($Runspace)
$EngineContextField = $RSEngine.GetType().GetFields($Private) | Where-Object {$_.FieldType.Name -eq 'ExecutionContext'}
$RSContext = $EngineContextField.GetValue($RSEngine)

# set the runspace to use the global ArgumentCompleters
$ContextCACProperty.SetValue($RSContext, $CAC)
$ContextNACProperty.SetValue($RSContext, $NAC)

$Wrapper = {
  # Without a sleep, you get issues:
  #   - occasional crashes
  #   - prompt not rendered
  #   - no highlighting
  # Assumption: this is related to PSReadLine.
  Start-Sleep -Milliseconds 5000
  . $GlobalState {. $Deferred; Remove-Variable Deferred}
}

$null = $Powershell.AddScript($Wrapper.ToString()).BeginInvoke()

##########################
#### Original Profile ####
##########################
# wouldn't work if it's in deferred_dir/chocolatey.ps1
Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1

# 24-bit color not restored after exiting vim in windows
# https://github.com/vim/vim/issues/5092
if ($PSVersionTable.OS -like '*Windows*' -and $host.UI.SupportsVirtualTerminal) {
  # it was fixed
  # function vim {
  #   Write-Host "`e[?1049h"
  #   vim.exe @args
  #   Write-Host "`e[?1049l"
  # }
  function less {
    Write-Host "`e[?1049h"
    less.exe @args
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

# thefuck
$env:PYTHONWARNINGS='ignore'; iex "$(thefuck --alias)"; # Remove-Item Env:PYTHONWARNINGS

# Aliases
Set-Alias grep findstr
Set-Alias open explorer
Set-Alias -Name which -Value 'C:\Windows\system32\where.exe'
Set-Alias trash Remove-ItemSafely
Remove-Alias diff -Force
Set-Alias diff delta
Set-Alias lzd lazydocker
Set-Alias lzg lazygit
# Set-Alias tere Invoke-Tere # tere cannot be excluded from the path

# ov pager
ov --completion powershell completion powershell | Out-String | Invoke-Expression

# eza and ripgrep
Remove-Alias ls -Force
Set-Alias ls eza
function ll { ls -l --color=always $args }
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

