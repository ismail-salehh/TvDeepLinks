#!/usr/bin/env bash
# Build TvDeepLinks as a webOS .ipk, install it on the LG TV and launch it.
#
# Usage: scripts/lg-run.sh [--inspect]
#   --inspect     also open Chrome DevTools for the app on the TV
#   WEBOS_DEVICE  TV nickname from scripts/lg-setup.sh (default: MyLGTV)
#
# Developer Mode expires: if installs suddenly fail, press Extend in the Developer Mode app.
set -euo pipefail
cd "$(dirname "$0")/.."

export WEBOS_DEVICE="${WEBOS_DEVICE:-MyLGTV}"
APP_ID="$(node -p "require('./webos/appinfo.json').id")"

if ! ares-device -i --device "$WEBOS_DEVICE" >/dev/null 2>&1; then
  echo "Can't reach '$WEBOS_DEVICE'. Is the TV on, Developer Mode active, and the IP unchanged?" >&2
  echo "If the IP changed: scripts/lg-setup.sh <new TV IP>" >&2
  exit 1
fi

npm run build:webos
npm run install:webos

if [[ "${1:-}" == "--inspect" ]]; then
  ares-inspect --device "$WEBOS_DEVICE" --app "$APP_ID" --open
fi
