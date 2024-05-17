# alternative conda activation method (https://github.com/conda/conda/issues/11648#issuecomment-1541546403)
# mamba activation (https://github.com/mamba-org/mamba/issues/1717#issuecomment-1292845827)
$Env:CONDA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\conda.exe"
$ENV:MAMBA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\mamba.exe"  # for mamba
$Env:_CE_M = ""
$Env:_CE_CONDA = ""
$Env:_CONDA_ROOT = "C:\Users\seanma\scoop\apps\miniconda3\current"
$Env:_CONDA_EXE = "C:\Users\seanma\scoop\apps\miniconda3\current\Scripts\conda.exe"
$CondaModuleArgs = @{ChangePs1 = $False}
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Conda.psm1" -ArgumentList $CondaModuleArgs
Import-Module "$Env:_CONDA_ROOT\shell\condabin\Mamba.psm1" -ArgumentList $CondaModuleArgs # for mamba
Remove-Variable CondaModuleArgs
