# $Env:CONDA_EXE = "C:/Users/seanma/scoop/apps/miniconda3/current/Scripts/conda.exe"
$Env:MAMBA_EXE = "C:/Users/seanma/scoop/apps/miniconda3/current/Scripts/mamba.exe"
$Env:_CE_M = ""
$Env:_CE_CONDA = ""
$Env:_CONDA_ROOT = "C:/Users/seanma/scoop/apps/miniconda3/current"
$Env:_CONDA_EXE = "C:/Users/seanma/scoop/apps/miniconda3/current/Scripts/conda.exe"
$CondaModuleArgs = @{ChangePs1 = $True}
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Conda.psm1" -ArgumentList $CondaModuleArgs

Remove-Variable CondaModuleArgs
