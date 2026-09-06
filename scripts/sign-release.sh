#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS="$ROOT/docs"
DIST="$DOCS/dists/termux"

rm -f "$DIST/Release.gpg" "$DIST/InRelease"
gpg --armor --detach-sign --output "$DIST/Release.gpg" "$DIST/Release"
gpg --clearsign --output "$DIST/InRelease" "$DIST/Release"
