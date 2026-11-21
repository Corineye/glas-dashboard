#!/bin/sh
# Baut die Karten aus src/ (einfach zusammenfügen, kein Werkzeug nötig)
set -e
cd "$(dirname "$0")"
ZIEL=custom_components/glas_dashboard/frontend/glas-dashboard.js
VERSION=$(sed -n 's/.*"version": "\(.*\)".*/\1/p' custom_components/glas_dashboard/manifest.json)
sed -i "s/^const VERSION = \".*\";/const VERSION = \"$VERSION\";/" src/00-basis.js
{ echo "/* Glas-Dashboard – Karten im Glas-Look für Home Assistant. Gebaut aus src/, nicht direkt bearbeiten. */"; echo "(() => {"; cat src/*.js; echo "})();"; } > "$ZIEL"
node --check "$ZIEL" && echo "ok: $(wc -c < "$ZIEL") Bytes"
