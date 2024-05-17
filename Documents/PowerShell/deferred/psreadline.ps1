Import-Module PSReadLine

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
