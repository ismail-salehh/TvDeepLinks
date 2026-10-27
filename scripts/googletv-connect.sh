#!/usr/bin/env bash
# Connect adb to a Google TV / Android TV over Wi-Fi.
#
# Usage: scripts/googletv-connect.sh [TV_IP]
#   TV_IP  optional; also read from $TV. If neither is set, the TV is found with `adb mdns services`.
#
# One-time on the TV: Settings → System → About → click "Android TV OS build" 7 times,
# then Settings → System → Developer options → USB debugging ON. Laptop and TV on the same Wi-Fi.
set -euo pipefail

TV="${1:-${TV:-}}"

port_open() { # host port
  if [[ "$(uname)" == "Darwin" ]]; then nc -z -G 3 "$1" "$2" >/dev/null 2>&1
  else nc -z -w 3 "$1" "$2" >/dev/null 2>&1; fi
}

if [[ -z "$TV" ]]; then
  echo "Looking for the TV with adb mdns (press a remote button if it's asleep)..."
  adb start-server >/dev/null
  for _ in 1 2 3 4 5 6; do
    # third column of the _adb._tcp line is IP:5555; keep only the IP
    TV="$(adb mdns services | awk '$2 ~ /^_adb\._tcp/ {split($3, a, ":"); print a[1]; exit}')"
    [[ -n "$TV" ]] && break
    sleep 5
  done
  if [[ -z "$TV" ]]; then
    echo "No TV found. Wake it (press a remote button), check USB debugging is ON, or pass the IP: $0 <TV_IP>" >&2
    exit 1
  fi
fi
echo "TV IP: $TV"

# Every Google TV keeps the Cast port open: proves the IP isn't another device's
if port_open "$TV" 8009; then
  echo "Port 8009 open: $TV is the TV"
else
  echo "Warning: port 8009 closed on $TV. It may not be the TV (or it's asleep). Trying anyway." >&2
fi

state="$(adb devices | awk -v d="$TV:5555" '$1 == d {print $2}')"
if [[ "$state" == "offline" ]]; then
  adb disconnect "$TV:5555" >/dev/null || true
  state=""
fi
if [[ "$state" != "device" ]]; then
  out="$(adb connect "$TV:5555" 2>&1)"; echo "$out"
  case "$out" in
    *refused*) echo "That IP belongs to another device now. Run again without an IP to rediscover." >&2; exit 1 ;;
    *timed\ out*) echo "The TV is asleep. Press a remote button and try again." >&2; exit 1 ;;
  esac
fi

for _ in $(seq 1 15); do
  state="$(adb devices | awk -v d="$TV:5555" '$1 == d {print $2}')"
  [[ "$state" == "device" ]] && break
  [[ "$state" == "unauthorized" ]] && echo "Look at the TV: tick 'Always allow' and press OK..."
  sleep 2
done
adb devices -l
if [[ "$state" != "device" ]]; then
  echo "TV is '$state', not 'device'. See the table in the Level 4 notes." >&2
  exit 1
fi

# Let the TV reach Metro on this laptop (lost on every disconnect)
adb -s "$TV:5555" reverse tcp:8081 tcp:8081
echo "Connected: $TV:5555 (adb reverse tcp:8081 set)"
echo "export TV=$TV"
