# conda & mamba initialization
# alternative conda activation method (https://github.com/conda/conda/issues/11648#issuecomment-1541546403)
# mamba activation (https://github.com/mamba-org/mamba/issues/1717#issuecomment-1292845827)
# $Env:CONDA_EXE = "C:\Users\seanma\miniforge3\Scripts\conda.exe"
# $ENV:MAMBA_EXE = "C:\Users\seanma\miniforge3\Scripts\mamba.exe"
# $Env:_CE_M = ""
# $Env:_CE_CONDA = ""
# $Env:_CONDA_ROOT = "C:\Users\seanma\miniforge3"
# $Env:_CONDA_EXE = "C:\Users\seanma\miniforge3\Scripts\conda.exe"
# $CondaModuleArgs = @{ChangePs1 = $False}
# Import-Module "$Env:_CONDA_ROOT\shell\condabin\Conda.psm1" -ArgumentList $CondaModuleArgs
# Import-Module "$Env:_CONDA_ROOT\shell\condabin\Mamba.psm1" -ArgumentList $CondaModuleArgs
# Remove-Variable CondaModuleArgs

#region conda initialize
# !! Contents within this block are managed by 'conda init' !!
If (Test-Path "C:\Users\seanma\miniforge3\Scripts\conda.exe") {
    (& "C:\Users\seanma\miniforge3\Scripts\conda.exe" "shell.powershell" "hook") | Out-String | ?{$_} | Invoke-Expression
}
#endregion

# activate envs
# conda activate base
# mamba activate utility

# activate python related commands
# thefuck
# $env:PYTHONIOENCODING='utf-8' 
# iex "$(thefuck --alias)"

