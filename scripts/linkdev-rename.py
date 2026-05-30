#!/usr/bin/env python3
"""Walk a directory tree and apply LiNKdev rename transformations."""

from __future__ import annotations

import sys
from pathlib import Path

BINARY_EXTENSIONS = {
    ".png",
    ".jpg",
    ".gif",
    ".webp",
    ".woff",
    ".bin",
    ".ico",
    ".pdf",
}

SKIP_DIR_NAMES = {".git"}

# Order matters — apply replacements in this exact sequence.
CONTENT_REPLACEMENTS: list[tuple[str, str]] = [
    ("LiNKdev/factory", "LiNKdev/factory"),
    ("LiNKdev/product", "LiNKdev/product"),
    ("LiNKdev/skills", "LiNKdev/skills"),
    ("LiNKdev/archive", "LiNKdev/archive"),
    ("LiNKdev/", "LiNKdev/"),
    ("LiNKdev", "LiNKdev"),
    ("LiNKdev", "LiNKdev"),
    ("LINKDEV_", "LINKDEV_"),
    ("LINKDEV", "LINKDEV"),
    ("linkdev:principal-stop", "linkdev:principal-stop"),
    ("linkdev:principal", "linkdev:principal"),
    ("principal_stop", "principal_stop"),
    ("Principal Release OK", "Principal Release OK"),
    ("Principal Continue", "Principal Continue"),
    ("Principal Go", "Principal Go"),
    ("Principal OK", "Principal OK"),
    ("Principal only", "Principal only"),
    ("Principal authorized", "Principal authorized"),
    ("Principal action", "Principal action"),
    ("Principal must", "Principal must"),
    ("Principal clicks", "Principal clicks"),
    ("Principal runs", "Principal runs"),
    ("Principal brief", "Principal brief"),
    ("Principal understands", "Principal understands"),
    ("Principal", "Principal"),
    ("linkdev:", "linkdev:"),
    ("wire-LiNKdev", "wire-linkdev"),
    ("LiNKdev-go", "linkdev-go"),
    ("LiNKdev-ui-automations", "linkdev-ui-automations"),
    ("00-LiNKdev-bootstrap", "00-linkdev-bootstrap"),
    ("LiNKdev-guard", "linkdev-guard"),
]

FILE_RENAMES: dict[str, str] = {
    "00-LiNKdev-bootstrap.mdc": "00-linkdev-bootstrap.mdc",
    "wire-LiNKdev.md": "wire-linkdev.md",
    "LiNKdev-go.md": "linkdev-go.md",
    "LiNKdev-ui-automations.md": "linkdev-ui-automations.md",
    "LiNKdev-guard.yml": "linkdev-guard.yml",
}

DIR_RENAME = ("LiNKdev", "LiNKdev")


def is_binary_file(path: Path) -> bool:
    return path.suffix.lower() in BINARY_EXTENSIONS


def apply_content_replacements(root: Path) -> int:
    changed = 0
    for path in root.rglob("*"):
        if not path.is_file() or is_binary_file(path):
            continue
        if any(part in SKIP_DIR_NAMES for part in path.parts):
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue

        updated = original
        for old, new in CONTENT_REPLACEMENTS:
            updated = updated.replace(old, new)

        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    return changed


def rename_target_name(name: str, *, is_dir: bool) -> str | None:
    if name in FILE_RENAMES:
        return FILE_RENAMES[name]
    if is_dir and name == DIR_RENAME[0]:
        return DIR_RENAME[1]
    return None


def rename_paths(root: Path) -> int:
    renamed = 0
    paths = sorted(
        (p for p in root.rglob("*") if not any(part in SKIP_DIR_NAMES for part in p.parts)),
        key=lambda p: len(p.parts),
        reverse=True,
    )
    for path in paths:
        new_name = rename_target_name(path.name, is_dir=path.is_dir())
        if not new_name or new_name == path.name:
            continue
        target = path.with_name(new_name)
        if target.exists():
            print(f"skip rename (target exists): {path} -> {target}", file=sys.stderr)
            continue
        path.rename(target)
        renamed += 1
        print(f"renamed: {path} -> {target}")
    return renamed


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 linkdev-rename.py <root_path>", file=sys.stderr)
        return 1

    root = Path(sys.argv[1]).resolve()
    if not root.is_dir():
        print(f"Error: not a directory: {root}", file=sys.stderr)
        return 1

    content_changed = apply_content_replacements(root)
    paths_renamed = rename_paths(root)

    print(
        f"Done. Updated {content_changed} file(s); renamed {paths_renamed} path(s) under {root}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
