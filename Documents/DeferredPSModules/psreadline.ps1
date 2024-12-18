Import-Module PSReadLine

Set-PSReadLineOption -HistorySearchCursorMovesToEnd
Set-PSReadLineOption -PredictionViewStyle List
if ($psMajorVersion -ge 6) {
    Set-PSReadLineOption -PredictionSource HistoryAndPlugin
}

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

# from https://github.com/benallred/configs/blob/f8814951e66d33feb4ed045b456a2ca60bd46658/powershell/PSReadLine.ps1 
# From https://github.com/PowerShell/PSReadLine/blob/master/PSReadLine/SamplePSReadLineProfile.ps1 with some changes
# smart braces
# Set-PSReadLineKeyHandler -Key '"', "'" `
# -BriefDescription SmartInsertQuote `
# -LongDescription "Insert paired quotes if not already on a quote" `
# -ScriptBlock {
#     param($key, $arg)
#     $quote = $key.KeyChar
#     $selectionStart = $null
#     $selectionLength = $null
#     [Microsoft.PowerShell.PSConsoleReadLine]::GetSelectionState([ref]$selectionStart, [ref]$selectionLength)
#     $line = $null
#     $cursor = $null
#     [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
#     # If text is selected, just quote it without any smarts
#     if ($selectionStart -ne -1) {
#         [Microsoft.PowerShell.PSConsoleReadLine]::Replace($selectionStart, $selectionLength, $quote + $line.SubString($selectionStart, $selectionLength) + $quote)
#         [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($selectionStart + $selectionLength + 2)
#         return
#     }
#     $ast = $null
#     $tokens = $null
#     $parseErrors = $null
#     [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$ast, [ref]$tokens, [ref]$parseErrors, [ref]$null)
#     function FindToken {
#         param($tokens, $cursor)
#         foreach ($token in $tokens) {
#             if ($cursor -lt $token.Extent.StartOffset) { continue }
#             if ($cursor -lt $token.Extent.EndOffset) {
#                 $result = $token
#                 $token = $token -as [System.Management.Automation.Language.StringExpandableToken]
#                 if ($token) {
#                     $nested = FindToken $token.NestedTokens $cursor
#                     if ($nested) { $result = $nested }
#                 }
#                 return $result
#             }
#         }
#         return $null
#     }
#     $token = FindToken $tokens $cursor
#     # If we're on or inside a **quoted** string token (so not generic), we need to be smarter
#     if ($token -is [System.Management.Automation.Language.StringToken] -and $token.Kind -ne [System.Management.Automation.Language.TokenKind]::Generic) {
#         # If we're at the start of the string, assume we're inserting a new string
#         if ($token.Extent.StartOffset -eq $cursor) {
#             [Microsoft.PowerShell.PSConsoleReadLine]::Insert("$quote$quote ")
#             [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor + 1)
#             return
#         }
#         # If we're at the end of the string, move over the closing quote if present.
#         if ($token.Extent.EndOffset -eq ($cursor + 1) -and $line[$cursor] -eq $quote) {
#             [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor + 1)
#             return
#         }
#     }
#     if ($null -eq $token -or
#         $token.Kind -eq [System.Management.Automation.Language.TokenKind]::RParen -or $token.Kind -eq [System.Management.Automation.Language.TokenKind]::RCurly -or $token.Kind -eq [System.Management.Automation.Language.TokenKind]::RBracket) {
#         if ($line[0..$cursor].Where{ $_ -eq $quote }.Count % 2 -eq 1) {
#             # Odd number of quotes before the cursor, insert a single quote
#             [Microsoft.PowerShell.PSConsoleReadLine]::Insert($quote)
#         }
#         else {
#             # Insert matching quotes, move cursor to be in between the quotes
#             [Microsoft.PowerShell.PSConsoleReadLine]::Insert("$quote$quote")
#             [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor + 1)
#         }
#         return
#     }
#     # If cursor is at the start of a token, enclose it in quotes.
#     if ($token.Extent.StartOffset -eq $cursor) {
#         if ($token.Kind -eq [System.Management.Automation.Language.TokenKind]::Generic -or $token.Kind -eq [System.Management.Automation.Language.TokenKind]::Identifier -or
#             $token.Kind -eq [System.Management.Automation.Language.TokenKind]::Variable -or $token.TokenFlags.hasFlag([System.Management.Automation.Language.TokenFlags]::Keyword)) {
#             $end = $token.Extent.EndOffset
#             $len = $end - $cursor
#             [Microsoft.PowerShell.PSConsoleReadLine]::Replace($cursor, $len, $quote + $line.SubString($cursor, $len) + $quote)
#             [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($end + 2)
#             return
#         }
#     }
#     # We failed to be smart, so just insert a single quote
#     [Microsoft.PowerShell.PSConsoleReadLine]::Insert($quote)
# }
# 
# Set-PSReadLineKeyHandler -Key '(', '{', '[' `
# -BriefDescription InsertPairedBraces `
# -LongDescription "Insert matching braces" `
# -ScriptBlock {
#     param($key, $arg)
# 
#     $closeChar = switch ($key.KeyChar) {
#         <#case#> '(' { [char]')'; break }
#         <#case#> '{' { [char]'}'; break }
#         <#case#> '[' { [char]']'; break }
#     }
# 
#     $selectionStart = $null
#     $selectionLength = $null
#     [Microsoft.PowerShell.PSConsoleReadLine]::GetSelectionState([ref]$selectionStart, [ref]$selectionLength)
# 
#     $line = $null
#     $cursor = $null
#     [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
# 
#     if ($selectionStart -ne -1) {
#         # Text is selected, wrap it in brackets
#         [Microsoft.PowerShell.PSConsoleReadLine]::Replace($selectionStart, $selectionLength, $key.KeyChar + $line.SubString($selectionStart, $selectionLength) + $closeChar)
#         [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($selectionStart + $selectionLength + 2)
#     }
#     else {
#         # No text is selected, insert a pair
#         [Microsoft.PowerShell.PSConsoleReadLine]::Insert("$($key.KeyChar)$closeChar")
#         [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor + 1)
#     }
# }
# 
# Set-PSReadLineKeyHandler -Key ')', ']', '}' `
# -BriefDescription SmartCloseBraces `
# -LongDescription "Insert closing brace or skip" `
# -ScriptBlock {
#     param($key, $arg)
# 
#     $line = $null
#     $cursor = $null
#     [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
# 
#     if ($line[$cursor] -eq $key.KeyChar) {
#         [Microsoft.PowerShell.PSConsoleReadLine]::SetCursorPosition($cursor + 1)
#     }
#     else {
#         [Microsoft.PowerShell.PSConsoleReadLine]::Insert("$($key.KeyChar)")
#     }
# }
# 
# Set-PSReadLineKeyHandler -Key Backspace `
# -BriefDescription SmartBackspace `
# -LongDescription "Delete previous character or matching quotes/parens/braces" `
# -ScriptBlock {
#     param($key, $arg)
# 
#     $line = $null
#     $cursor = $null
#     [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
# 
#     if ($cursor -gt 0) {
#         $toMatch = $null
#         if ($cursor -lt $line.Length) {
#             switch ($line[$cursor]) {
#                 <#case#> '"' { $toMatch = '"'; break }
#                 <#case#> "'" { $toMatch = "'"; break }
#                 <#case#> ')' { $toMatch = '('; break }
#                 <#case#> ']' { $toMatch = '['; break }
#                 <#case#> '}' { $toMatch = '{'; break }
#             }
#         }
# 
#         if ($toMatch -ne $null -and $line[$cursor - 1] -eq $toMatch) {
#             [Microsoft.PowerShell.PSConsoleReadLine]::Delete($cursor - 1, 2)
#         }
#         else {
#             [Microsoft.PowerShell.PSConsoleReadLine]::BackwardDeleteChar($key, $arg)
#         }
#     }
# }

