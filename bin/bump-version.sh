#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <major|minor|patch> [version_file]" >&2
  exit 1
fi

bump_type="$1"
version_file="${2:-VERSION}"

if [[ ! -f "$version_file" ]]; then
  echo "Version file '$version_file' not found." >&2
  exit 1
fi

current_version="$(tr -d '[:space:]' < "$version_file")"

if [[ ! "$current_version" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  echo "Invalid semantic version '$current_version' in '$version_file'." >&2
  exit 1
fi

major="${BASH_REMATCH[1]}"
minor="${BASH_REMATCH[2]}"
patch="${BASH_REMATCH[3]}"

case "$bump_type" in
  patch)
    patch=$((patch + 1))
    ;;
  minor)
    minor=$((minor + 1))
    patch=0
    ;;
  major)
    major=$((major + 1))
    minor=0
    patch=0
    ;;
  *)
    echo "Invalid bump type '$bump_type'. Use major, minor, or patch." >&2
    exit 1
    ;;
esac

next_version="${major}.${minor}.${patch}"
printf '%s\n' "$next_version" > "$version_file"
printf '%s\n' "$next_version"
