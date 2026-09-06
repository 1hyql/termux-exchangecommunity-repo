#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS="$ROOT/docs"
DIST="$DOCS/dists/termux"
RELEASE_FILE="$DIST/Release"

mkdir -p "$DIST"

{
  echo "Origin: Termux Exchange Community Repo"
  echo "Label: Termux Exchange Community Repo"
  echo "Suite: termux"
  echo "Codename: termux"
  echo "Version: 1.0"
  echo "Architectures: aarch64"
  echo "Components: main"
  echo "Description: Community maintained Termux packages"
  echo "Date: $(date -Ru)"
  echo "SHA256:"
  find "$DIST" -type f \( -name "Packages" -o -name "Packages.gz" \) | sort | while read -r f; do
    size=$(stat -c%s "$f")
    hash=$(sha256sum "$f" | awk '{print $1}')
    rel="${f#$DIST/}"
    echo " $hash $size $rel"
  done
} > "$RELEASE_FILE"
