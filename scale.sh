# ============================================================
#  Alatyon Horizontal Scaling Script (Windows PowerShell)
#  Usage: .\scale.ps1 -users 1000
#  Example: .\scale.ps1 -users 500
# ============================================================

param(
  [int]$users = 100
)

# ── Decide instances based on user count ─────────────────────
if ($users -le 100) {
  $instances = 1
  Write-Host "👤 Users: $users  →  🟢 1 instance (small load)" -ForegroundColor Green

} elseif ($users -le 500) {
  $instances = 2
  Write-Host "👤 Users: $users  →  🟡 2 instances (medium load)" -ForegroundColor Yellow

} elseif ($users -le 1000) {
  $instances = 3
  Write-Host "👤 Users: $users  →  🟠 3 instances (high load)" -ForegroundColor Yellow

} elseif ($users -le 5000) {
  $instances = 5
  Write-Host "👤 Users: $users  →  🔴 5 instances (very high load)" -ForegroundColor Red

} elseif ($users -le 10000) {
  $instances = 8
  Write-Host "👤 Users: $users  →  🔴 8 instances (extreme load)" -ForegroundColor Red

} else {
  $instances = 12
  Write-Host "👤 Users: $users  →  🚨 12 instances (max load)" -ForegroundColor Magenta
}

Write-Host ""
Write-Host "⚙️  Scaling app to $instances instance(s)..." -ForegroundColor Cyan

# Scale using docker-compose
docker-compose up -d --scale app=$instances --no-recreate

Write-Host ""
Write-Host "✅ Done! Running containers:" -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "📊 Resource usage:" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"