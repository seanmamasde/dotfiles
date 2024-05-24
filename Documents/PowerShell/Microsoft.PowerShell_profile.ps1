# deferred loading to improve performance
# https://fsackur.github.io/2023/11/20/Deferred-profile-loading-for-better-performance/
$Deferred = {
  . "$HOME\Documents\PowerShell\deferred\chocolately.ps1"
#  . "$HOME\Documents\PowerShell\deferred\conda.ps1"
  . "$HOME\Documents\PowerShell\deferred\custom_commands.ps1"
  . "$HOME\Documents\PowerShell\deferred\lazy_functions.ps1"
  . "$HOME\Documents\PowerShell\deferred\lazy_modules.ps1"
  . "$HOME\Documents\PowerShell\deferred\psreadline.ps1"
  . "$HOME\Documents\PowerShell\deferred\scoop.ps1"
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
  Start-Sleep -Milliseconds 200
  . $GlobalState {. $Deferred; Remove-Variable Deferred}
}

$null = $Powershell.AddScript($Wrapper.ToString()).BeginInvoke()

# PSReadLine Moved out of deferred loading since it tends to cause problems
. $HOME/Documents/PowerShell/deferred/psreadline.ps1

##########################
#### Original Profile ####
##########################
# 24-bit color not restored after exiting vim in windows
# https://github.com/vim/vim/issues/5092
if ($PSVersionTable.OS -like '*Windows*' -and $host.UI.SupportsVirtualTerminal) {
  function vim {
    Write-Host "`e[?1049h"
    vim.exe @args
    Write-Host "`e[?1049l"
  }
}

# conda
# alternative conda activation method (https://github.com/conda/conda/issues/11648#issuecomment-1541546403)
# mamba activation (https://github.com/mamba-org/mamba/issues/1717#issuecomment-1292845827)
$Env:CONDA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\conda.exe"
# $ENV:MAMBA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\mamba.exe"  # for mamba
$Env:_CE_M = ""
$Env:_CE_CONDA = ""
$Env:_CONDA_ROOT = "C:\Users\seanma\scoop\apps\miniconda3\current"
$Env:_CONDA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\conda.exe"
$CondaModuleArgs = @{ChangePs1 = $False}
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Conda.psm1" -ArgumentList $CondaModuleArgs
# Import-Module "$Env:_CONDA_ROOT\shell\condabin\Mamba.psm1" -ArgumentList $CondaModuleArgs # for mamba
Remove-Variable CondaModuleArgs

# conda activate base

# enable thefuck
# $env:PYTHONIOENCODING='utf-8'
# iex "$(thefuck --alias --enable-experimental-instant-mode)"

# starship
if ($env:TERM_PROGRAM -ne 'vscode') {
  $ENV:STARSHIP_CONFIG = "$HOME\.config\starship.toml"
  Invoke-Expression (&starship init powershell)
}

# chezmoi
$chezmoi_dir = "C:\Users\seanma\.local\share\chezmoi"

# deferred profile loading directory
$deferred_dir = "C:\Users\seanma\Documents\PowerShell\deferred"

# zoxide
Invoke-Expression (& { (zoxide init powershell | Out-String) })

# Aliases
Set-Alias grep findstr
Set-Alias open explorer
Set-Alias -Name which -Value 'C:\Windows\system32\where.exe'
Set-Alias trash Remove-ItemSafely
Remove-Alias diff -Force
Set-Alias diff delta

# add my predefined directory of symlinks to path
# $env:Path += ";C:\Users\seanma\MySymlinks"

# eza and ripgrep
Remove-Alias ls -Force
Set-Alias ls eza
function ll { ls -la --hyperlink $args }
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
