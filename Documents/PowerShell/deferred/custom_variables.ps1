# deferred loaded powershell scripts directory
$deferred_dir = "$HOME\Documents\PowerShell\deferred"

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
$chezmoi_paths = @(
  "$HOME\README.md",  # readme of the repo
  "$profile",
  "$deferred_dir",
  "$HOME\miniforge3\.condarc", # condarc
  "$HOME\.gitconfig", # gitconfig
  "$HOME\AppData\Local\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json", # windows terminal settings.json
  "$HOME\source\scripts"  # custom scripts
  "$HOME\AppData\Roaming\nushell\config.nu" # $nu.config-path
  "$HOME\AppData\Roaming\nushell\env.nu"  # $nu.env-path
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
