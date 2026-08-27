#!/usr/bin/env bash
# Désinstalle Castor Desktop de Linux :
#   paquet .deb (si installé) · AppImage laissée à l'utilisateur · données locales
# Usage : bash scripts/uninstall-linux.sh
set -euo pipefail

step() { printf "\n\033[1m🦫 %s\033[0m\n" "$1"; }
ok()   { printf "  ✓ %s\n" "$1"; }

step "Paquet .deb…"
if command -v dpkg >/dev/null 2>&1 && dpkg -s castor-desktop >/dev/null 2>&1; then
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    apt-get remove -y castor-desktop
  else
    sudo apt-get remove -y castor-desktop
  fi
  ok "paquet castor-desktop retiré"
else
  ok "pas de paquet castor-desktop — rien à faire"
fi

step "Raccourci applicatif…"
rm -f "$HOME/.local/share/applications/castor.desktop"
rm -f "/usr/share/applications/castor.desktop" 2>/dev/null || true
ok "raccourcis retirés"

step "Données locales (réglages, mémoire, clés)…"
rm -rf "$HOME/.config/castor-desktop"
ok "~/.config/castor-desktop"

printf "\n✅ Castor est désinstallé.\n"
printf "   AppImage ? Supprime simplement le fichier Castor-Linux-*.AppImage où tu l'as posé.\n"
