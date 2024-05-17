#######################
####### Aliases #######
####################### 
Set-Alias -Name emacs Invoke-emacs
function Invoke-emacs { C:\Users\seanma\scoop\shims\emacs.exe -nw $args[0] }

Set-Alias btop Invoke-btop4win
function Invoke-btop4win { gsudo btop }

Set-Alias scr Invoke-Screensaver
function Invoke-Screensaver { nircmd.exe screensaver }

function wtadmin { Start-Process wt.exe -Verb runAs }

# https://unix.stackexchange.com/a/81699/37512
function wanip { & dig resolver4.opendns.com myip.opendns.com +short }
function wanip4 { & dig resolver4.opendns.com myip.opendns.com +short -4 }
function wanip6 { & dig resolver1.ipv6-sandbox.opendns.com AAAA myip.opendns.com +short -6 }
#######################

# powershell profiling: https://github.com/nohwnd/Profiler
Set-Alias profile Invoke-Profile
function Invoke-Profile {
  pwsh -NoProfile -NoExit { 
    $trace = Trace-Script { . $Profile }
    $trace.Top50Duration | Format-Table -AutoSize
    exit
  }
}

# pandoc markdown to pdf
function mkpdf () {
  param([string]$mdFilePath)
  # extract the directory path and filename without extension
  $directoryPath = Split-Path -Parent $mdFilePath
  $fileNameWithoutExtension = [System.IO.Path]::GetFileNameWithoutExtension($mdFilePath)
  $pdfFilePath = Join-Path -Path $directoryPath -ChildPath ($fileNameWithoutExtension + '.pdf')
  pandoc $mdFilePath -o $pdfFilePath --pdf-engine=xelatex --toc --from markdown --template 'C:\Users\seanma\.pandoc\templates\eisvogel.tex' --toc-depth=4 --listings
}
