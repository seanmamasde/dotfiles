# Import-Module scoop-completion

# scoop-search: https://github.com/shilangyu/scoop-search
# Invoke-Expression (& scoop-search --hook)

# scoop commands replacements
Invoke-Expression (&sfsu hook)

# enable scoop completion in current shell, use absolute path because PowerShell Core not respect $env:PSModulePath
# Import-Module "$($(Get-Item $(Get-Command scoop.ps1).Path).Directory.Parent.FullName)\modules\scoop-completion"
