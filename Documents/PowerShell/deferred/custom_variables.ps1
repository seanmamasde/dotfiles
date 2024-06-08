$deferred_dir = "$HOME\Documents\PowerShell\deferred"

# chezmoi related
$chezmoi_dir = "$HOME\.local\share\chezmoi"
$chezmoi_paths = @(
  "$HOME\README.md",  # readme of the repo
  "$profile",
  "$deferred_dir",
  "$HOME\.condarc", # condarc
  "$HOME\.gitconfig", # gitconfig
  "$HOME\AppData\Local\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json", # windows terminal settings.json
  "$HOME\source\scripts"  # custom scripts
  "$HOME\AppData\Roaming\nushell\config.nu" # $nu.config-path
  "$HOME\AppData\Roaming\nushell\env.nu"  # $nu.env-path
)

