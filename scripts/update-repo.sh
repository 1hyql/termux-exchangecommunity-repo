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
        echo "Package: $(dpkg-deb -f "$deb" Package)"
        echo "Version: $(dpkg-deb -f "$deb" Version)"
        echo "Section: $(dpkg-deb -f "$deb" Section)"
        echo "Priority: $(dpkg-deb -f "$deb" Priority)"
        echo "Architecture: $(dpkg-deb -f "$deb" Architecture)"
        echo "Installed-Size: $(dpkg-deb -f "$deb" Installed-Size)"
        echo "Depends: $(dpkg-deb -f "$deb" Depends)"
        echo "Maintainer: $(dpkg-deb -f "$deb" Maintainer)"
        echo "Description: $(dpkg-deb -f "$deb" Description)"
        echo "Homepage: $(dpkg-deb -f "$deb" Homepage)"
        echo "Filename: packages/$(basename "$deb")"
        echo "Size: $(stat -c%s "$deb")"
        echo "SHA256: $(sha256sum "$deb" | awk '{print $1}')"
        echo
    } >> "$ARCH_DIR/Packages"
done

gzip -k "$ARCH_DIR/Packages"
