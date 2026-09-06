#!/bin/bash
# 将 APT Packages 索引序列化为 packages.json；recommended 默认 false
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGES_FILE="$ROOT/docs/dists/termux/main/binary-aarch64/Packages"
OUT="$ROOT/docs/packages.json"

# 推荐包（空格分隔）
RECOMMENDED=""

if [ ! -f "$PACKAGES_FILE" ]; then
  echo "错误：找不到索引文件 $PACKAGES_FILE" >&2
  exit 1
fi

UPDATED_AT="$(date -Iseconds)"

awk -v updated_at="$UPDATED_AT" -v recommended_list="$RECOMMENDED" '
function esc(s) {
  gsub(/\\/, "\\\\", s)
  gsub(/"/, "\\\"", s)
  gsub(/\r/, "", s)
  return s
}
function flush(   is_rec, n, i, r, rec) {
  if (name == "") return
  rec = "    {\n"
  rec = rec "      \"name\": \"" esc(name) "\",\n"
  rec = rec "      \"version\": \"" esc(version) "\",\n"
  if (section   != "") rec = rec "      \"section\": \"" esc(section) "\",\n"
  if (priority  != "") rec = rec "      \"priority\": \"" esc(priority) "\",\n"
  rec = rec "      \"architecture\": \"" esc(architecture) "\",\n"
  rec = rec "      \"maintainer\": \"" esc(maintainer) "\",\n"
  rec = rec "      \"description\": \"" esc(description) "\",\n"
  if (homepage  != "") rec = rec "      \"homepage\": \"" esc(homepage) "\",\n"
  is_rec = "false"
  n = split(recommended_list, r, /[ \t]+/)
  for (i = 1; i <= n; i++) if (r[i] == name) { is_rec = "true"; break }
  rec = rec "      \"recommended\": " is_rec "\n    }"
  if (!first_rec) rec = ",\n" rec
  printf "%s", rec
  first_rec = 0

  name = ""; version = ""; section = ""; priority = ""
  architecture = ""; maintainer = ""; description = ""; homepage = ""
}
BEGIN {
  printf "{\n"
  printf "  \"updated_at\": \"%s\",\n", updated_at
  printf "  \"packages\": [\n"
  first_rec = 1
  name = ""
}
{
  # 空行 = 一条记录结束
  if (length($0) == 0) { flush(); next }
  # 续行（通常是多行 Description）忽略，只取主字段首行
  if (substr($0, 1, 1) == " " || substr($0, 1, 1) == "\t") next
  key = $1; sub(/:/, "", key)
  val = substr($0, index($0, ":") + 1)
  gsub(/^[ \t]+|[ \t]+$/, "", val)
  if      (key == "Package")        name = val
  else if (key == "Version")        version = val
  else if (key == "Section")        section = val
  else if (key == "Priority")       priority = val
  else if (key == "Architecture")   architecture = val
  else if (key == "Maintainer")     maintainer = val
  else if (key == "Description")    description = val
  else if (key == "Homepage")       homepage = val
}
END {
  flush()
  printf "\n  ]\n}\n"
}
' "$PACKAGES_FILE" > "$OUT"

echo "已生成 $OUT"