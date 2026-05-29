<#
  CloudRestaurant - local SQL Server (SQLEXPRESS) setup helper
  --------------------------------------------------------------
  Enables TCP/IP, sets a static port, and switches the instance to
  Mixed Mode (SQL + Windows) authentication so the Node backend can connect.

  RUN THIS IN AN ELEVATED (Administrator) PowerShell:
      powershell -ExecutionPolicy Bypass -File scripts\setup-local-sqlserver.ps1

  After it finishes, enable the 'sa' login + set its password in SSMS
  (see the instructions printed at the end), then run database\schema.sql
  and database\seed.sql.
#>

param(
  [string]$Instance = "SQLEXPRESS",          # named instance; use "MSSQLSERVER" for the default instance
  [int]$Port = 1435,                          # static TCP port (avoid 1433 if the default instance uses it)
  [string]$SaPassword = "YourStrong!Passw0rd" # password to set for the sa login
)

$ErrorActionPreference = "Stop"

# 0) Require admin
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error "Please run this script in an ELEVATED (Administrator) PowerShell."
  exit 1
}

# 1) Resolve the internal instance id (e.g. MSSQL15.SQLEXPRESS)
$instanceId = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL').$Instance
if (-not $instanceId) { Write-Error "Instance '$Instance' not found."; exit 1 }
Write-Host "Instance id: $instanceId" -ForegroundColor Cyan

$base = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\$instanceId\MSSQLServer"
$tcp  = "$base\SuperSocketNetLib\Tcp"

# 2) Enable TCP/IP protocol
Set-ItemProperty -Path $tcp -Name "Enabled" -Value 1
Write-Host "TCP/IP enabled." -ForegroundColor Green

# 3) Set a static port on IPAll, clear dynamic ports
Set-ItemProperty -Path "$tcp\IPAll" -Name "TcpPort" -Value "$Port"
Set-ItemProperty -Path "$tcp\IPAll" -Name "TcpDynamicPorts" -Value ""
Write-Host "Static TCP port set to $Port." -ForegroundColor Green

# 4) Switch to Mixed Mode authentication (LoginMode = 2)
Set-ItemProperty -Path $base -Name "LoginMode" -Value 2 -Type DWord
Write-Host "Mixed Mode (SQL + Windows) authentication enabled." -ForegroundColor Green

# 5) Restart the SQL Server service so changes take effect
$svc = if ($Instance -eq "MSSQLSERVER") { "MSSQLSERVER" } else { "MSSQL`$$Instance" }
Write-Host "Restarting service $svc ..." -ForegroundColor Cyan
Restart-Service -Name $svc -Force
Start-Sleep -Seconds 3
Write-Host "Service restarted." -ForegroundColor Green

# 6) Enable + set password for the sa login (uses local Windows Auth, no sqlcmd needed)
try {
  $connStr = "Server=.\$Instance;Database=master;Integrated Security=True;TrustServerCertificate=True;Connect Timeout=15"
  $conn = New-Object System.Data.SqlClient.SqlConnection $connStr
  $conn.Open()
  $cmd = $conn.CreateCommand()
  $cmd.CommandText = "ALTER LOGIN sa ENABLE; ALTER LOGIN sa WITH PASSWORD = N'$SaPassword';"
  [void]$cmd.ExecuteNonQuery()
  $conn.Close()
  Write-Host "sa login enabled and password set." -ForegroundColor Green
} catch {
  Write-Host "Could not enable sa automatically: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Run this manually in SSMS:  ALTER LOGIN sa ENABLE; ALTER LOGIN sa WITH PASSWORD = '$SaPassword';" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " DONE. SQLEXPRESS now accepts SQL logins on localhost,$Port" -ForegroundColor Green
Write-Host " Backend .env -> DB_SERVER=localhost DB_PORT=$Port DB_USER=sa" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
