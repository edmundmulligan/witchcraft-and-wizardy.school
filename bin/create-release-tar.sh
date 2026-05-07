#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <version> <folder> [output_dir]" >&2
  echo "" >&2
  echo "Arguments:" >&2
  echo "  version     Semantic version (e.g. 1.2.3)" >&2
  echo "  folder      Subfolder to archive (e.g. web, api)." >&2
  echo "  output_dir  Destination directory for the archive (default: releases)" >&2
  exit 1
fi

version="$1"
folder="${2%/}"
output_dir="${3:-releases}"

if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid semantic version '$version'." >&2
  exit 1
fi

if [[ ! -d "$folder" ]]; then
  echo "Folder '$folder' does not exist." >&2
  exit 1
fi

if [[ -z "$folder" ]]; then
  echo "Folder must not be empty." >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

mkdir -p "$folder/$output_dir"

archive_folder_name="${folder//\//-}"
archive_name="${archive_folder_name}-witchcraft-and-wizardry-v${version}.tar.gz"
archive_path="${folder}/${output_dir}/${archive_name}"

# Hidden paths are excluded by default.
# Add repo-relative entries here to include specific hidden paths.
INCLUDE_HIDDEN_PATHS=(
)

is_hidden_path() {
  local rel_path="$1"
  local segment
  IFS='/' read -r -a segments <<< "$rel_path"
  for segment in "${segments[@]}"; do
    if [[ "$segment" == .* ]]; then
      return 0
    fi
  done
  return 1
}

is_allowlisted_hidden_path() {
  local rel_path="$1"
  local allowed
  for allowed in "${INCLUDE_HIDDEN_PATHS[@]}"; do
    allowed="${allowed#./}"
    allowed="${allowed%/}"
    if [[ "$rel_path" == "$allowed" || "$rel_path" == "$allowed/"* ]]; then
      return 0
    fi
  done
  return 1
}

tmp_file_list="$(mktemp)"
trap 'rm -f "$tmp_file_list"' EXIT

while IFS= read -r -d '' path; do
  rel_path="${path#./}"

  if is_hidden_path "$rel_path" && ! is_allowlisted_hidden_path "$rel_path"; then
    continue
  fi

  printf '%s\n' "$rel_path" >> "$tmp_file_list"
done < <(find "$folder" -mindepth 1 \( -type f -o -type l \) -print0)

if [[ ! -s "$tmp_file_list" ]]; then
  echo "No files to archive after applying hidden-path exclusions in '$folder'." >&2
  exit 1
fi

tar -czf "$archive_path" -T "$tmp_file_list"
printf '%s\n' "$archive_path"
