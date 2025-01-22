$Env:MAMBA_EXE = "C:\Users\seanma\miniforge3\Scripts\mamba.exe"
$Env:_CE_M = $null
$Env:_CE_CONDA = $null
$Env:_CONDA_ROOT = "C:/Users/seanma/scoop/apps/miniconda3/current"
$Env:_MAMBA_EXE = "C:\Users\seanma\miniforge3\Scripts\mamba.exe"
$CondaModuleArgs = @{ChangePs1 = $False}
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Mamba.psm1" -ArgumentList $CondaModuleArgs

Remove-Variable CondaModuleArgs
