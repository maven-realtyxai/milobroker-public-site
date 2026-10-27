param(
  [ValidateSet('setup', 'dev', 'check', 'build', 'preview')]
  [string]$Task = 'dev'
)
$ErrorActionPreference = 'Stop'
# Use the same npm commands as README; do not maintain a second build pipeline.
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  throw 'Install Node.js 22 or newer with npm, then reopen PowerShell.'
}
Push-Location (Join-Path $PSScriptRoot '..')
try {
  if ($Task -eq 'setup') { npm.cmd ci }
  else { npm.cmd run $Task }
  if ($LASTEXITCODE -ne 0) { throw "npm task failed: $Task" }
} finally {
  Pop-Location
}
