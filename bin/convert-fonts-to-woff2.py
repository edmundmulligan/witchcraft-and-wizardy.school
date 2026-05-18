#!/usr/bin/env python3
from pathlib import Path
from fontTools.ttLib import TTFont


def main() -> None:
    fonts_dir = Path("web/fonts")
    for ttf_path in sorted(fonts_dir.glob("*.ttf")):
        woff2_path = ttf_path.with_suffix(".woff2")
        font = TTFont(str(ttf_path))
        font.flavor = "woff2"
        font.save(str(woff2_path))
        print(f"{ttf_path.name} -> {woff2_path.name}")


if __name__ == "__main__":
    main()
