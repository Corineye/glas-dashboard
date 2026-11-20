#!/bin/sh
# Baut glas-dashboard.js aus src/ (einfach zusammenfügen, kein Werkzeug nötig)
set -e
cd "$(dirname "$0")"
{ echo "/* Glas-Dashboard – Karten im Glas-Look für Home Assistant. Gebaut aus src/, nicht direkt bearbeiten. */"; echo "(() => {"; cat src/*.js; echo "})();"; } > glas-dashboard.js
node --check glas-dashboard.js && echo "ok: $(wc -c < glas-dashboard.js) Bytes"
