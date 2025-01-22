$OriginalPath = $Env:Path
$Env:Path = "C:\Users\seanma\scoop\shims\wslgit.exe;" + $Env:Path
$Env:GIT = "wslgit"
nvim
$Env:Path = $OriginalPath
