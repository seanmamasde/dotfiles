#######################
####### Aliases #######
####################### 
Set-Alias -Name emacs Invoke-emacs
function Invoke-emacs { C:\Users\seanma\scoop\shims\emacs.exe -nw $args[0] }

Set-Alias btop Invoke-btop4win
function Invoke-btop4win { gsudo btop }

Set-Alias scr Invoke-Screensaver
function Invoke-Screensaver { nircmd.exe screensaver }

# just run gsudo to enter admin mode
# function wtadmin { Start-Process wt.exe -Verb runAs }

# powershell profiling: https://github.com/nohwnd/Profiler
Set-Alias profile Invoke-Profile
function Invoke-Profile {
  if ($psMajorVersion -ge 6) {
    pwsh -NoProfile -NoExit { 
      $trace = Trace-Script { . $Profile }
      $trace.Top50Duration | Format-Table -AutoSize
      exit
    }
  } else {
    powershell -NoProfile -NoExit { 
      $trace = Trace-Script { . $Profile }
      $trace.Top50Duration | Format-Table -AutoSize
      exit
    }
  }
}

# reload gpg agent
Set-Alias reloadgpg Invoke-ReloadGpgAgent
function Invoke-ReloadGpgAgent {
  & "gpg-connect-agent.exe" reloadagent /bye
}

# get the content and source of a command
Set-Alias what Get-ContentAndSource
function Get-ContentAndSource {
  param (
    [Parameter(Mandatory = $true)]
    [string]$CommandName
  )

  # Retrieve the command info
  $command = Get-Command -Name $CommandName -ErrorAction SilentlyContinue
  if (-not $command) {
    Write-Error "Command '$CommandName' not found."
    return
  }

  # Base properties for all command types
  $result = [PSCustomObject]@{
    CommandName = $CommandName
    CommandType = $command.CommandType
  }

  # Add details based on command type
  switch ($command.CommandType) {
    # Content and Source is both available for Function
    'Function' {
      $result | Add-Member -NotePropertyName SourceFile -NotePropertyValue $command.ScriptBlock.File
      $result | Add-Member -NotePropertyName Content -NotePropertyValue $command.ScriptBlock
    }

    # Alias has only Content
    'Alias' {
      $result | Add-Member -NotePropertyName Content -NotePropertyValue $command.ResolvedCommand
    }

    # Cmdlet has only Source
    'Cmdlet' {
      $result | Add-Member -NotePropertyName SourceFile -NotePropertyValue $command.DLL
    }
  }

  return $result
}

