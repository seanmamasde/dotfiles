# Prompt
# Import-Module Terminal-Icons # impacts startup performance heavily
# Import-Module scoop-completion
Import-Module posh-git
Import-Module PSFzf
Import-Module PSReadLine
Import-Module Recycle
Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1
Import-Module "C:\Users\seanma\AppData\Local\PowerToys\WinUI3Apps\..\WinGetCommandNotFound.psd1"

# PSReadLine
Set-PSReadLineOption -PredictionSource HistoryAndPlugin
Set-PSReadLineOption -PredictionViewStyle List
# https://stackoverflow.com/questions/8360215/use-ctrl-d-to-exit-and-ctrl-l-to-cls-in-powershell-console
Set-PSReadlineKeyHandler -Key ctrl+d -Function ViExit
# Related: https://github.com/PowerShell/PSReadLine/issues/1778
Set-PSReadLineKeyHandler -Key Shift+Delete `
-BriefDescription RemoveFromHistory `
-LongDescription "Removes the content of the current line from history" `
-ScriptBlock {
  param($key, $arg)

  $line = $null
  $cursor = $null
  [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)

  $toRemove = [Regex]::Escape(($line -replace "\n", "```n"))
  $history = Get-Content (Get-PSReadLineOption).HistorySavePath -Raw
  $history = $history -replace "(?m)^$toRemove\r\n", ""
  Set-Content (Get-PSReadLineOption).HistorySavePath $history
}

# PSFzf
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+f' -PSReadlineChordReverseHistory 'Ctrl+r'

# starship
if ($env:TERM_PROGRAM -ne 'vscode') {
  $ENV:STARSHIP_CONFIG = "$HOME\.config\starship.toml"
  Invoke-Expression (&starship init powershell)
}

# fnm
# fnm env --use-on-cd | Out-String | Invoke-Expression

# scoop-search: https://github.com/shilangyu/scoop-search
# Invoke-Expression (& scoop-search --hook)

# scoop commands replacements
Invoke-Expression (&sfsu hook) #

# enable scoop completion in current shell, use absolute path because PowerShell Core not respect $env:PSModulePath
Import-Module "$($(Get-Item $(Get-Command scoop.ps1).Path).Directory.Parent.FullName)\modules\scoop-completion"

# alternative conda activation method (https://github.com/conda/conda/issues/11648#issuecomment-1541546403)
# mamba activation (https://github.com/mamba-org/mamba/issues/1717#issuecomment-1292845827)
$Env:CONDA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\conda.exe"
$ENV:MAMBA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\mamba.exe"  # for mamba
$Env:_CE_M = ""
$Env:_CE_CONDA = ""
$Env:_CONDA_ROOT = "C:\Users\seanma\scoop\apps\miniconda3\current"
$Env:_CONDA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\conda.exe"
$CondaModuleArgs = @{ChangePs1 = $False}
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Conda.psm1" -ArgumentList $CondaModuleArgs
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Mamba.psm1" -ArgumentList $CondaModuleArgs # for mamba
Remove-Variable CondaModuleArgs

# enable thefuck
# $env:PYTHONIOENCODING='utf-8'
# iex "$(thefuck --alias --enable-experimental-instant-mode)"

# Chocolatey
# $ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyprofile.psm1"
# if (Test-Path($ChocolateyProfile)) {
#     Import-Module "$ChocolateyProfile"
# }

# 24-bit color not restored after exiting vim in windows
# https://github.com/vim/vim/issues/5092
if ($PSVersionTable.OS -like '*Windows*' -and $host.UI.SupportsVirtualTerminal) {
  function vim {
    Write-Host "`e[?1049h"
      vim.exe @args
      Write-Host "`e[?1049l"
  }
}

# zoxide
Invoke-Expression (& { (zoxide init powershell | Out-String)  }) #

# Aliases
Set-Alias grep findstr
Set-Alias open explorer
Set-Alias -Name which -Value 'C:\Windows\system32\where.exe'
Set-Alias trash Remove-ItemSafely
# Set-Alias -Name emacs Invoke-emacs
Set-Alias btop Invoke-btop4win
Set-Alias scr Invoke-Screensaver
Remove-Alias diff -Force
Set-Alias diff delta
# Set-Alias hash Get-FileHash
Set-Alias profile Invoke-Profile
function wtadmin { Start-Process wt.exe -Verb runAs }
# Set-Alias github 'C:\Users\seanma\scoop\apps\gh\current\bin\gh.exe'

# add my predefined directory of symlinks to path
# $env:Path += ";C:\Users\seanma\MySymlinks"

# https://unix.stackexchange.com/a/81699/37512
function wanip { & dig resolver4.opendns.com myip.opendns.com +short }
function wanip4 { & dig resolver4.opendns.com myip.opendns.com +short -4 }
function wanip6 { & dig resolver1.ipv6-sandbox.opendns.com AAAA myip.opendns.com +short -6 }

# eza and ripgrep
Remove-Alias ls -Force
Set-Alias ls eza
function ll { ls -la --hyperlink $args }
function tree { ls --tree -da $args }
function rgf { rg --files | rg $args }

# wireguard commands
# gsudo wireguard /installtunnelservice "C:\Users\seanma\.wireguard_configs\UDR_wgsrv1.conf"
# gsudo wireguard /uninstalltunnelservice "UDR_wgsrv1"

# Utilities
function touch {
  $file = $args[0]
    if($null -eq $file) {
      Write-Host "No filename supplied"
    }
    else {
      if(Test-Path $file) {
        (Get-ChildItem $file).LastWriteTime = Get-Date
      }
      else {
        Write-Output $null > $file
      }
    }
}

# function source { . $args[0] } # doesn't work whatsoever
function path { $Env:Path.Split(';') }

function choco-cleaner {
  Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
    pwsh C:\tools\BCURRAN3\choco-cleaner.ps1
}

function Invoke-Profile {
  pwsh -NoProfile -NoExit { 
    $trace = Trace-Script { . $Profile }
    $trace.Top50Duration | ft -AutoSize
      exit
  }
}

# starts emacs in another terminal window
# function Invoke-emacs { C:\Users\seanma\scoop\shims\emacs.exe -nw $args[0] }

# start btop4win in windows terminal window
function Invoke-btop4win { gsudo btop }

# nircmd screensaver
function Invoke-Screensaver { nircmd.exe screensaver }

# pandoc Alias
function mkpdf () {
  param([string]$mdFilePath)
# extract the directory path and filename without extension
    $directoryPath = Split-Path -Parent $mdFilePath
    $fileNameWithoutExtension = [System.IO.Path]::GetFileNameWithoutExtension($mdFilePath)
    $pdfFilePath = Join-Path -Path $directoryPath -ChildPath ($fileNameWithoutExtension + '.pdf')
    pandoc $mdFilePath -o $pdfFilePath --pdf-engine=xelatex --toc --from markdown --template 'C:\Users\seanma\.pandoc\templates\eisvogel.tex' --toc-depth=4 --listings
}

# modify prompt words
# function prompt { 
#     $prompt = $env:USERNAME + "@" + $env:COMPUTERNAME + ":"
#     $currDir = "$( ( get-item $pwd ).Name )"
#     if ($currDir -eq "seanma") {
#         $prompt += "~> "
#     } else {
#         $prompt += $currDir
#     }
# 
#     echo $prompt
# }

# try { $null = gcm pshazz -ea stop; pshazz init 'default' } catch { }

