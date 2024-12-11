# deferred loaded powershell scripts directory
$deferred_dir = "$HOME\Documents\DeferredPSModules\"

# wsl home directories
$wsl_fedora = "\\wsl.localhost\fedoraremix\home\seanma\"
$wsl_nixos = "\\wsl.localhost\fedoraremix\home\seanma\"

# libraries directory
$libraries = @(
  "$HOME\Documents",
  "$HOME\Music",
  "$HOME\Pictures",
  "$HOME\Videos"
)

# chezmoi related
$chezmoi_dir = "$HOME\.local\share\chezmoi"
$chezmoi_readme = "$HOME\README.md"
$chezmoi_paths = @(
  # readme of the repo
  $chezmoi_readme,

  # powershell 5.1 and 7 profiles
  "$HOME\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1",
  "$HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1",
  $deferred_dir,

  # condarc
  "$HOME\miniforge3\.condarc",

  # gitconfig
  "$HOME\.gitconfig",

  # wslconfig
  "$HOME\.wslconfig",

  # Windows Terminal settings.json
  "$HOME\AppData\Local\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json",

  # custom scripts
  "$HOME\source\scripts"

  # $nu.config-path and $nu.env-path
  "$HOME\AppData\Roaming\nushell\config.nu" 
  "$HOME\AppData\Roaming\nushell\env.nu"

  # starship.toml
  "$HOME\.config\starship.toml"

  # "$HOME\.unison"   # unison definitions
)
# append prf files to chezmoi_paths
$unison_dir = "$HOME\.unison"
$prf_files = Get-ChildItem -Path $unison_dir -Filter *.prf -File
foreach ($file in $prf_files) {
  $chezmoi_paths += $file.FullName
}

# global variables
$PAGER = "ov"
$HOSTS = "C:\Windows\System32\drivers\etc\hosts"
$EDITOR = "nvim"
$VISUAL = "bat"
