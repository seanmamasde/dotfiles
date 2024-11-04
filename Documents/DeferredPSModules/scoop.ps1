# Import-Module scoop-completion

# scoop-search: https://github.com/shilangyu/scoop-search
Invoke-Expression (& scoop-search --hook)

# scoop commands replacements: sfsu
# Invoke-Expression (&sfsu hook --disable list status)

# enable scoop completion in current shell, use absolute path because PowerShell Core not respect $env:PSModulePath
# Import-Module "$($(Get-Item $(Get-Command scoop.ps1).Path).Directory.Parent.FullName)\modules\scoop-completion"
Import-Module "$HOME\scoop\apps\scoop-completion\current\scoop-completion.psm1"
