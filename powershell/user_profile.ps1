# Prompt
Import-Module posh-git
Import-Module Mdbc
Import-Module PSFzf
Import-Module PSReadLine

# Icons
Import-Module -Name Terminal-Icons

# PSReadLine
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -PredictionViewStyle ListView

# fuck
iex "$(thefuck --alias)"

# PSFzf
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+f' -PSReadlineChordReverseGHistory 'Ctrl+r'

# oh-my-posh
oh-my-posh init pwsh --config ~/.config/oh-my-posh/default_time_tweaked.omp.json | Invoke-Expression

# Alias
Set-Alias tig 'C:\Program Files\Git\usr\bin\tig.exe'
Set-Alias less 'C:\Program Files\Git\usr\bin\less.exe'
Set-Alias mongo 'C:\Program Files\MongoDB\Server\6.0\bin\mongos.exe'
Set-Alias mongod 'C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe'
Set-Alias grep findstr

# Utilities
function which ($command) {
	Get-Command -Name $command -ErrorAction SilentlyContinue |
	Select-Object -ExpandProperty Path -ErrorAction SilentlyContinue
}
function touch {
  Param(
    [Parameter(Mandatory=$true)]
    [string]$Path
  )
  if (Test-Path -LiteralPath $Path) {
    (Get-Item -Path $Path).LastWriteTime = Get-Date
  } else {
    New-Item -Type File -Path $Path
  }
}
function ln ($target, $link) {
    New-Item -Path $link -ItemType SymbolicLink -Value $target
}
function emacs {
    Start-process 'emacs.exe -nw'
}
function wtadmin {
    Start-Process -FilePath 'wt.exe' -Verb RunAs
}