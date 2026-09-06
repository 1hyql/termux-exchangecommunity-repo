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

    {
        dpkg-deb -f "$deb" Package
        dpkg-deb -f "$deb" Version
        dpkg-deb -f "$deb" Section
        dpkg-deb -f "$deb" Priority
        dpkg-deb -f "$deb" Architecture
        dpkg-deb -f "$deb" Installed-Size
        dpkg-deb -f "$deb" Depends
        dpkg-deb -f "$deb" Maintainer
        dpkg-deb -f "$deb" Description
        dpkg-deb -f "$deb" Homepage
        echo "Filename: packages/$(basename "$deb")"
        echo "Size: $(stat -c%s "$deb")"
        echo "SHA256: $(sha256sum "$deb" | awk '{print $1}')"
        echo
    } >> "$ARCH_DIR/Packages"
done

gzip -k "$ARCH_DIR/Packages"
