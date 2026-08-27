# Désinstalle Castor Desktop de Windows quand il a été lancé en PORTABLE
# (zip sans installateur) : processus, données locales, raccourcis.
# Pour la version installée (NSIS), utilise plutôt :
#   Paramètres > Applications > "Castor Desktop" > Désinstaller
#
# Usage : powershell -ExecutionPolicy Bypass -File scripts\uninstall-windows.ps1

Write-Host ""
Write-Host "🦫 Désinstallation de Castor (version portable)…" -ForegroundColor Yellow

# 1 · fermer Castor s'il tourne
Get-Process -Name "Castor" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "  ✓ processus arrêté"

# 2 · données locales (réglages, mémoire persistante, clés chiffrées)
$data = Join-Path $env:APPDATA "castor-desktop"
if (Test-Path $data) { Remove-Item -Recurse -Force $data }
Write-Host "  ✓ $data supprimé"

# 3 · raccourcis du bureau et du menu démarrer (si tu en avais créé)
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcut = Join-Path $desktop "Castor.lnk"
if (Test-Path $shortcut) { Remove-Item $shortcut }
$startMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Castor.lnk"
if (Test-Path $startMenu) { Remove-Item $startMenu }
Write-Host "  ✓ raccourcis retirés"

Write-Host ""
Write-Host "✅ Il ne reste plus qu'à supprimer le dossier décompressé (Castor-win-unpacked ou ton zip extrait)." -ForegroundColor Green
Write-Host ""
