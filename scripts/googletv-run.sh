#!/usr/bin/env bash
# Connect to the Google TV, then build, install and launch TvDeepLinks on it.
#
# Usage: scripts/googletv-run.sh [TV_IP]
#   Run `npm start` (Metro) in another terminal first; press j there for the debugger.
#   Set UNINSTALL=1 to remove an installed build signed with a different key
#   (fixes INSTALL_FAILED_UPDATE_INCOMPATIBLE).
set -euo pipefail
cd "$(dirname "$0")/.."

APP_ID="com.tvdeeplinks"

# googletv-connect.sh prints "export TV=<ip>" last
TV="$(scripts/googletv-connect.sh "$@" | tee /dev/stderr | awk -F= '/^export TV=/ {print $2}' | tail -n1)"
[[ -n "$TV" ]] || { echo "Could not connect to the TV." >&2; exit 1; }

if [[ "${UNINSTALL:-0}" == "1" ]]; then
  adb -s "$TV:5555" uninstall "$APP_ID" || true
fi

npx react-native run-android --deviceId "$TV:5555" --no-packager
