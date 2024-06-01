$deferred_dir = "$HOME\Documents\PowerShell\deferred"

# chezmoi related
$chezmoi_dir = "$HOME\.local\share\chezmoi"
$chezmoi_paths = @(
  "$HOME/.condarc", # condarc
  "$HOME/.gitconfig", # gitconfig
  "$HOME/AppData/Local/Packages/Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe/LocalState/settings.json", # windows terminal settings.json
  "$HOME/README.md",  # readme of the repo
  "$HOME/source/scripts"  # custom scripts  
)
$chezmoi_all = $chezmoi_paths -join ' '

