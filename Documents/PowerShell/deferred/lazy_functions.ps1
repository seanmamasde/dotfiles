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
  pwsh -NoProfile -NoExit { 
    $trace = Trace-Script { . $Profile }
    $trace.Top50Duration | Format-Table -AutoSize
    exit
  }
}

