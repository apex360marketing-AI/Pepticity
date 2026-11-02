@echo off
rem One-click start: runs setup.ps1 from this folder. ExecutionPolicy Bypass applies to this one run only.
rem Add  -Preview  after setup.ps1 below to see every step without changing anything.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
