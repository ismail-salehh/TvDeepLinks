#!/usr/bin/env bash
# One-time: save and pair an LG webOS TV with the ares tools.
#
# Usage: scripts/lg-setup.sh <TV_IP>
#   Also run it again when the TV's IP changes.
#   WEBOS_DEVICE  nickname for the TV on this laptop (default: MyLGTV)
#
# Before running, on the TV: Developer Mode app → Dev Mode Status ON and Key Server ON,
# reboot, reopen the app and leave it on screen. It shows the IP and the passphrase.
set -euo pipefail

TV_IP="${1:-}"
DEVICE="${WEBOS_DEVICE:-MyLGTV}"
[[ -n "$TV_IP" ]] || { echo "Usage: $0 <TV_IP>   (IP shown in the TV's Developer Mode app)" >&2; exit 1; }

if ! command -v ares-setup-device >/dev/null; then
  echo "Installing LG's ares tools..."
  npm install -g @webos-tools/cli
fi

# add the TV, or update its IP if it's already saved
if ares-setup-device --list | awk 'NR > 2 {print $1}' | grep -qx "$DEVICE"; then
  ares-setup-device -m "$DEVICE" -i "host=$TV_IP"
else
  # prisoner and 9922 are fixed for every LG developer TV
  ares-setup-device -a "$DEVICE" -i "username=prisoner" -i "host=$TV_IP" -i "port=9922"
fi
ares-setup-device -f "$DEVICE"

echo
echo "Pairing: type the passphrase shown in the Developer Mode app on the TV."
if ! ares-novacom --device "$DEVICE" --getkey; then
  echo "Retrying without proxy settings..."
  NO_PROXY='*' no_proxy='*' ares-novacom --device "$DEVICE" --getkey || {
    echo "Pairing failed. Check the TV and laptop are on the same network, and toggle Key Server OFF/ON in the Developer Mode app." >&2
    exit 1
  }
fi

ares-device -i --device "$DEVICE"
echo "LG TV '$DEVICE' is paired. Next: scripts/lg-run.sh"
