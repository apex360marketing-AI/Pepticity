<#
  ONE-CLICK SETUP KIT (Windows 10 22H2+/11). Shared by every client; the client's
  details live in kit.json next to this file. Started by the .cmd file.

  Safety rules this script keeps (see the audit on the review page):
   - Installs only from winget's official community source, by exact package ID,
     or opens the maker's own download page (Hermes has no winget package).
   - Never asks for, reads, stores or sends a password, key or token.
   - Never pipes a downloaded script into PowerShell (no iex/irm).
   - Tailscale is installed but left SIGNED OUT and DOWN. Remote help is only
     switched on by the client, for a set time, with remote-help.ps1.
   - Writes a plain-English log to Documents.
   - -Preview shows every step and changes nothing.
#>
[CmdletBinding()]
param([switch]$Preview)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$cfg  = Get-Content -Raw -Path (Join-Path $here 'kit.json') | ConvertFrom-Json
$docs = [Environment]::GetFolderPath('MyDocuments')
$log  = Join-Path $docs ("{0} Setup Log.txt" -f $cfg.business)
$home2 = Join-Path $env:LOCALAPPDATA ($cfg.business -replace '[^A-Za-z0-9]', '')

function Say([string]$t) {
  $line = "{0:yyyy-MM-dd HH:mm}  {1}" -f (Get-Date), $t
  Write-Host $t
  if (-not $Preview) { Add-Content -Path $log -Value $line }
}

Clear-Host
Write-Host ""
Write-Host ("  {0} SETUP KIT" -f $cfg.business.ToUpper()) -ForegroundColor White
Write-Host ("  Prepared for {0} by {1}" -f $cfg.client, $cfg.agency)
Write-Host ""
Write-Host "  This will:"
foreach ($a in $cfg.apps) { Write-Host ("   - install {0}: {1}" -f $a.name, $a.why) }
Write-Host ("   - put your Command Center on the desktop and open it at start-up")
Write-Host ""
Write-Host "  It will NOT ask for any password. You sign in to each app yourself afterwards."
Write-Host "  Remote help stays OFF until you switch it on."
if ($Preview) { Write-Host "`n  PREVIEW MODE: nothing will be changed." -ForegroundColor Yellow }
Write-Host ""
$ok = Read-Host "  Type YES to continue"
if ($ok -ne 'YES') { Write-Host "  Nothing was changed."; exit 0 }

# winget must exist (it ships with Windows 11 as App Installer)
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "  Windows' app installer (winget) is missing. Opening the Microsoft Store page for App Installer."
  if (-not $Preview) { Start-Process 'ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1' }
  exit 1
}

Say "Setup started for $($cfg.client)."
foreach ($a in $cfg.apps) {
  if ($a.winget) {
    if ($a.winget -notmatch '^[A-Za-z0-9][A-Za-z0-9\.\-]+$') { Say "Skipped $($a.name): bad package ID."; continue }
    Say "Installing $($a.name) from its maker ($($a.winget))..."
    if (-not $Preview) {
      winget install --id $a.winget --exact --source winget --silent --accept-package-agreements --accept-source-agreements --disable-interactivity | Out-Null
      if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq -1978335189) { Say "  $($a.name): done." }   # -1978335189 = already installed
      else { Say "  $($a.name): did not install (code $LASTEXITCODE). APEX will check this." }
    }
  } elseif ($a.page) {
    if ($a.page -notmatch '^https://') { Say "Skipped $($a.name): page is not https."; continue }
    Say "Opening the official $($a.name) download page. Click its Install button when it opens."
    if (-not $Preview) { Start-Process $a.page }
  }
}

# Tailscale: installed, but kept signed out and down until the client asks for help
$ts = Join-Path $env:ProgramFiles 'Tailscale\tailscale.exe'
if (Test-Path $ts) { Say "Remote help is OFF (Tailscale installed, not connected)."; if (-not $Preview) { & $ts down 2>$null } }

# Command Center: copy the page locally and open it at start-up in a clean app window
Say "Placing your Command Center."
if (-not $Preview) {
  New-Item -ItemType Directory -Force -Path $home2 | Out-Null
  Copy-Item -Force (Join-Path $here 'command-center.html') (Join-Path $home2 'command-center.html')
  Copy-Item -Force (Join-Path $here 'remote-help.ps1') (Join-Path $home2 'remote-help.ps1')
  $chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
  $url = 'file:///' + ((Join-Path $home2 'command-center.html') -replace '\\', '/')
  $ws = New-Object -ComObject WScript.Shell
  foreach ($dir in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Startup'))) {
    $lnk = $ws.CreateShortcut((Join-Path $dir ("{0} Command Center.lnk" -f $cfg.business)))
    if ($chrome) { $lnk.TargetPath = $chrome; $lnk.Arguments = "--app=$url" } else { $lnk.TargetPath = $url }
    $lnk.Save()
  }
  # two desktop buttons for remote help: ON for 1 hour, and OFF now
  $desk = [Environment]::GetFolderPath('Desktop')
  foreach ($b in @(@('Remote help ON (1 hour)', '-On -Minutes 60'), @('Remote help OFF', '-Off'))) {
    $lnk = $ws.CreateShortcut((Join-Path $desk ($b[0] + '.lnk')))
    $lnk.TargetPath = 'powershell.exe'
    $lnk.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$(Join-Path $home2 'remote-help.ps1')`" $($b[1])"
    $lnk.Save()
  }
}

Say "Setup finished. Next: sign in to each app (see your Command Center, Setup Kit step 4)."
Write-Host "`n  All done. A log is in your Documents folder." -ForegroundColor Green
if (-not $Preview) { Read-Host "  Press Enter to close" | Out-Null }
