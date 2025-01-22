$Env:CONDA_EXE = "C:\Users\seanma\miniforge3\Scripts\conda.exe"
$Env:_CE_M = $null
$Env:_CE_CONDA = $null
$Env:_CONDA_ROOT = "C:\Users\seanma\miniforge3"
$Env:_CONDA_EXE = "C:\Users\seanma\miniforge3\Scripts\conda.exe"
$CondaModuleArgs = @{ChangePs1 = $False}
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Conda.psm1" -ArgumentList $CondaModuleArgs

Remove-Variable CondaModuleArgs
