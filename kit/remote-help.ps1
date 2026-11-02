<#
  Remote help, switched on BY THE CLIENT for a set time, then off by itself.
    remote-help.ps1 -On -Minutes 60     connect Tailscale; schedule automatic disconnect
    remote-help.ps1 -Off                disconnect now
  Tailscale must already be signed in to the client's own account (done once, by the client).
  No keys or passwords are used or stored here.
#>
[CmdletBinding()]
param([switch]$On, [switch]$Off, [ValidateRange(5, 240)][int]$Minutes = 60)
$ErrorActionPreference = 'Stop'
$ts = Join-Path $env:ProgramFiles 'Tailscale\tailscale.exe'
if (-not (Test-Path $ts)) { Write-Host 'Tailscale is not installed.'; exit 1 }
$task = 'RemoteHelpAutoOff'
$log = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Remote Help Log.txt'

if ($Off -or -not $On) {
  & $ts down
  Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue
  Add-Content $log ("{0:yyyy-MM-dd HH:mm}  Remote help switched OFF." -f (Get-Date))
  Write-Host 'Remote help is OFF.'
  exit 0
}

& $ts up
$at = (Get-Date).AddMinutes($Minutes)
$action = New-ScheduledTaskAction -Execute "$ts" -Argument 'down'
$trigger = New-ScheduledTaskTrigger -Once -At $at
Register-ScheduledTask -TaskName $task -Action $action -Trigger $trigger -Force | Out-Null
Add-Content $log ("{0:yyyy-MM-dd HH:mm}  Remote help switched ON until {1:HH:mm}." -f (Get-Date), $at)
Write-Host ("Remote help is ON until {0:HH:mm}. It switches itself off then." -f $at)
