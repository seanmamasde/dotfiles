# wireguard commands
function wg_up_udr { gsudo wireguard /installtunnelservice "C:\Users\seanma\.wireguard_configs\UDR_wgsrv1.conf" }
function wg_dn_udr { gsudo wireguard /uninstalltunnelservice "UDR_wgsrv1" }

# CloudFlare Warp
$warp_cli='C:\Program Files\Cloudflare\Cloudflare WARP\warp-cli.exe'
function warp_up { & "$warp_cli" connect }
function warp_dn { & "$warp_cli" disconnect }

# https://unix.stackexchange.com/a/81699/37512
function wanip { & dig resolver4.opendns.com myip.opendns.com +short }
function wanip4 { & dig resolver4.opendns.com myip.opendns.com +short -4 }
function wanip6 { & dig resolver1.ipv6-sandbox.opendns.com AAAA myip.opendns.com +short -6 }

# pandoc markdown to pdf
function mkpdf () {
  param([string]$mdFilePath)
  # extract the directory path and filename without extension
  $directoryPath = Split-Path -Parent $mdFilePath
  $fileNameWithoutExtension = [System.IO.Path]::GetFileNameWithoutExtension($mdFilePath)
  $pdfFilePath = Join-Path -Path $directoryPath -ChildPath ($fileNameWithoutExtension + '.pdf')
  pandoc $mdFilePath -o $pdfFilePath --pdf-engine=xelatex --toc --from markdown --template 'C:\Users\seanma\.pandoc\templates\eisvogel.tex' --toc-depth=4 --listings
}

