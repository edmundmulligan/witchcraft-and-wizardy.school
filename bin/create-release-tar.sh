#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <version> [output_dir]" >&2
  exit 1
fi

version="$1"
output_dir="${2:-releases}"

if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid semantic version '$version'." >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

mkdir -p "$output_dir"

archive_name="puffin-web-project-edmundmulligan-v${version}.tar.gz"
archive_path="${output_dir}/${archive_name}"

paths=(
  index.html
  bin
  data
  diagnostics
  images
  lessons
  mentors
  pages
  scripts
  students
  styles
  templates
  VERSION
)

for path in "${paths[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "Required path '$path' does not exist." >&2
    exit 1
  fi
done

tar -czf "$archive_path" "${paths[@]}"
printf '%s\n' "$archive_path"
