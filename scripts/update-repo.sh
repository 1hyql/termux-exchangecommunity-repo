#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS="$ROOT/docs"
DIST="$DOCS/dists/termux"
ARCH_DIR="$DIST/main/binary-aarch64"

mkdir -p "$ARCH_DIR"
rm -f "$ARCH_DIR/Packages" "$ARCH_DIR/Packages.gz"

for deb in "$DOCS"/packages/*.deb; do
    [ -e "$deb" ] || continue
    dpkg-deb -I "$deb" >> "$ARCH_DIR/Packages"
    echo "Filename: packages/$(basename "$deb")" >> "$ARCH_DIR/Packages"
    echo "Size: $(stat -c%s "$deb")" >> "$ARCH_DIR/Packages"
    echo "SHA256: $(sha256sum "$deb" | awk '{print $1}')" >> "$ARCH_DIR/Packages"
    echo "" >> "$ARCH_DIR/Packages"
done

gzip -k "$ARCH_DIR/Packages"
