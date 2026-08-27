#!/usr/bin/env bash
# Désinstalle Castor Desktop de macOS :
#   application · réglages · mémoire persistante · clés chiffrées · caches
# Usage : bash scripts/uninstall-macos.sh   (aucun sudo nécessaire)
set -euo pipefail

step() { printf "\n\033[1m🦫 %s\033[0m\n" "$1"; }
ok()   { printf "  ✓ %s\n" "$1"; }

step "Fermeture de Castor s'il tourne…"
osascript -e 'quit app "Castor"' >/dev/null 2>&1 || true
sleep 1
ok "Castor est arrêté."

step "Suppression de l'application…"
rm -rf "/Applications/Castor.app"
ok "/Applications/Castor.app"

step "Suppression des réglages et données locales…"
rm -rf "$HOME/Library/Application Support/Castor"
rm -rf "$HOME/Library/Application Support/castor-desktop"
rm -f  "$HOME/Library/Preferences/app.castor.desktop.plist"
rm -rf "$HOME/Library/Saved Application State/app.castor.desktop.savedState"
rm -rf "$HOME/Library/Caches/app.castor.desktop"
ok "Application Support · Preferences · Saved State · Caches"

printf "\n✅ Castor est entièrement désinstallé.\n"
printf "   (Ton workspace, tes projets et conversations ont été retirés avec les réglages.)\n"
