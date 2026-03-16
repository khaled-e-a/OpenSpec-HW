/**
 * Compare Images Skill Template
 *
 * Utility skill (no command counterpart) — always installed regardless of profile.
 * Ships a self-contained Python script for pixel-level image comparison.
 * Follows agentskills.io best practices: PEP 723 inline deps, CLI flags only,
 * JSON to stdout, diagnostics to stderr, meaningful exit codes.
 */

import type { SkillTemplate } from '../types.js';

const INSTRUCTIONS_BODY = `## Overview

Compare two images pixel-by-pixel and report how many pixels differ. Optionally save a visual diff image highlighting the differences.

## Available scripts

- **\`scripts/compare_images.py\`** — Self-contained comparison script. Accepts all input via CLI flags; outputs JSON to stdout.

## Workflow

### Basic comparison

\`\`\`bash
uv run scripts/compare_images.py IMAGE1 IMAGE2
\`\`\`

### Save a diff image

\`\`\`bash
uv run scripts/compare_images.py IMAGE1 IMAGE2 --diff-output diff.png
\`\`\`

### Adjust sensitivity

\`\`\`bash
uv run scripts/compare_images.py IMAGE1 IMAGE2 --threshold 0.05
\`\`\`

### Preview without writing files

\`\`\`bash
uv run scripts/compare_images.py IMAGE1 IMAGE2 --diff-output diff.png --dry-run
\`\`\`

## Script reference

\`\`\`
uv run scripts/compare_images.py [OPTIONS] IMAGE1 IMAGE2

Compare two images pixel-by-pixel and report differences.

Arguments:
  IMAGE1            Path to the first (baseline) image
  IMAGE2            Path to the second (actual) image

Options:
  --diff-output FILE   Save a visual diff image to FILE (PNG)
  --threshold FLOAT    Per-pixel sensitivity, 0.0–1.0 (default: 0.1)
                       Lower = stricter. 0.1 treats colours within ~10%
                       brightness as matching.
  --include-aa         Count anti-aliased pixels as differences
  --dry-run            Validate inputs and report what would happen;
                       do not write any files
  --help               Show this message and exit

Exit codes:
  0   Images are identical (within threshold)
  1   Images differ
  2   Error (missing file, unsupported format, invalid arguments)
\`\`\`

## Output format

On success the script writes a JSON object to stdout:

\`\`\`json
{
  "success": true,
  "diff_pixels": 42,
  "total_pixels": 307200,
  "percent_diff": 0.0137,
  "width": 640,
  "height": 480,
  "diff_image_path": "/abs/path/to/diff.png",
  "message": "Comparison complete: 42 pixels differ (0.01%)"
}
\`\`\`

On error the script writes to stderr and exits with code 2:

\`\`\`
Error: IMAGE1 not found: /path/to/missing.png
Usage: uv run scripts/compare_images.py IMAGE1 IMAGE2 [OPTIONS]
\`\`\`

## Notes

- Supported formats: PNG, JPEG/JPG, BMP, GIF (first frame), WebP.
- If the images have different dimensions they are resized to the smaller of the two before comparison.
- \`diff_image_path\` is omitted from the JSON when \`--diff-output\` is not supplied.
- All dependencies are declared inline (PEP 723) — no separate \`pip install\` step needed when using \`uv run\`.
- Requires [uv](https://docs.astral.sh/uv/) (\`pip install uv\` or \`brew install uv\`).
`;

const SCRIPTS: Record<string, string> = {
  'scripts/compare_images.py': `# /// script
# requires-python = ">=3.9"
# dependencies = [
#   "Pillow>=10.0,<12",
#   "numpy>=1.24,<3",
# ]
# ///
"""Compare two images pixel-by-pixel and report differences.

Usage:
    uv run scripts/compare_images.py IMAGE1 IMAGE2 [OPTIONS]

Exit codes:
    0  Images are identical (within threshold)
    1  Images differ
    2  Error (missing file, unsupported format, invalid arguments)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="uv run scripts/compare_images.py",
        description="Compare two images pixel-by-pixel and report differences.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exit codes:
  0   Images are identical (within threshold)
  1   Images differ
  2   Error (missing file, unsupported format, invalid arguments)

Examples:
  uv run scripts/compare_images.py baseline.png actual.png
  uv run scripts/compare_images.py baseline.png actual.png --diff-output diff.png
  uv run scripts/compare_images.py baseline.png actual.png --threshold 0.05
  uv run scripts/compare_images.py baseline.png actual.png --diff-output diff.png --dry-run
""",
    )
    parser.add_argument("image1", metavar="IMAGE1", help="Path to the first (baseline) image")
    parser.add_argument("image2", metavar="IMAGE2", help="Path to the second (actual) image")
    parser.add_argument(
        "--diff-output",
        metavar="FILE",
        help="Save a visual diff image to FILE (PNG)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.1,
        metavar="FLOAT",
        help="Per-pixel sensitivity 0.0–1.0 (default: 0.1). Lower = stricter.",
    )
    parser.add_argument(
        "--include-aa",
        action="store_true",
        help="Count anti-aliased pixels as differences",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate inputs and report what would happen; do not write any files",
    )
    return parser


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def die(message: str) -> None:
    """Print an error to stderr and exit with code 2."""
    print(f"Error: {message}", file=sys.stderr)
    print("Usage: uv run scripts/compare_images.py IMAGE1 IMAGE2 [--help]", file=sys.stderr)
    sys.exit(2)


def load_rgba(path: str):
    """Load an image and return an RGBA PIL Image."""
    from PIL import Image, UnidentifiedImageError  # noqa: PLC0415

    p = Path(path)
    if not p.exists():
        die(f"file not found: {path}")
    try:
        img = Image.open(p)
        img.load()  # force decode so errors surface here
        return img.convert("RGBA")
    except UnidentifiedImageError:
        die(f"unsupported or corrupt image: {path}")


def resize_to_smaller(img1, img2):
    """Resize both images to the smaller of the two dimensions."""
    from PIL import Image  # noqa: PLC0415

    w = min(img1.width, img2.width)
    h = min(img1.height, img2.height)
    if img1.size != (w, h):
        img1 = img1.resize((w, h), Image.LANCZOS)
    if img2.size != (w, h):
        img2 = img2.resize((w, h), Image.LANCZOS)
    return img1, img2


def compare(img1, img2, threshold: float, include_aa: bool):
    """
    Compare two same-size RGBA PIL Images.

    Returns (diff_pixels, total_pixels, diff_rgba_array).
    Uses a per-channel Euclidean distance approach:
      distance = sqrt(mean((ch1 - ch2)^2)) / 255
    A pixel is counted as different when distance > threshold.
    Anti-aliased pixels (those surrounded by near-identical neighbours)
    are skipped unless include_aa is True.
    """
    import numpy as np  # noqa: PLC0415

    a1 = np.array(img1, dtype=np.float32)
    a2 = np.array(img2, dtype=np.float32)

    # Per-pixel distance (0.0 – 1.0)
    dist = np.sqrt(np.mean((a1 - a2) ** 2, axis=2)) / 255.0

    diff_mask = dist > threshold

    if not include_aa:
        # Simple anti-alias heuristic: skip pixels where all 8 neighbours
        # are within threshold of the pixel itself in img1.
        padded = np.pad(dist, 1, mode="edge")
        neighbour_max = np.zeros_like(dist)
        for dy in range(3):
            for dx in range(3):
                if dy == 1 and dx == 1:
                    continue
                neighbour_max = np.maximum(neighbour_max, padded[dy : dy + dist.shape[0], dx : dx + dist.shape[1]])
        aa_mask = neighbour_max <= threshold
        diff_mask = diff_mask & ~aa_mask

    # Build diff image: red for changed pixels, faint original for unchanged
    diff_arr = np.zeros_like(a1, dtype=np.uint8)
    # Blend unchanged pixels at 20% opacity
    diff_arr[~diff_mask] = (a1[~diff_mask] * 0.2).astype(np.uint8)
    # Mark changed pixels in red
    diff_arr[diff_mask] = [255, 0, 0, 255]

    diff_pixels = int(diff_mask.sum())
    total_pixels = dist.size

    return diff_pixels, total_pixels, diff_arr


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    # Validate threshold
    if not (0.0 <= args.threshold <= 1.0):
        die(f"--threshold must be between 0.0 and 1.0, got {args.threshold!r}")

    # Load images (die() on any problem)
    img1 = load_rgba(args.image1)
    img2 = load_rgba(args.image2)

    # Normalise dimensions
    img1, img2 = resize_to_smaller(img1, img2)
    width, height = img1.size
    total_pixels = width * height

    # Dry-run: report what would happen, then exit successfully
    if args.dry_run:
        print(
            json.dumps(
                {
                    "dry_run": True,
                    "image1": str(Path(args.image1).resolve()),
                    "image2": str(Path(args.image2).resolve()),
                    "comparison_size": {"width": width, "height": height},
                    "threshold": args.threshold,
                    "include_aa": args.include_aa,
                    "diff_output": str(Path(args.diff_output).resolve()) if args.diff_output else None,
                    "message": "Dry run complete. No files written.",
                }
            )
        )
        sys.exit(0)

    # Run comparison
    diff_pixels, total_pixels, diff_arr = compare(img1, img2, args.threshold, args.include_aa)
    percent_diff = round((diff_pixels / total_pixels) * 100, 4)

    # Save diff image if requested
    diff_image_path: str | None = None
    if args.diff_output:
        from PIL import Image  # noqa: PLC0415

        out_path = Path(args.diff_output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(diff_arr, "RGBA").save(out_path, format="PNG")
        diff_image_path = str(out_path.resolve())
        print(f"Diff image saved: {diff_image_path}", file=sys.stderr)

    # Build result
    result: dict = {
        "success": True,
        "diff_pixels": diff_pixels,
        "total_pixels": total_pixels,
        "percent_diff": percent_diff,
        "width": width,
        "height": height,
        "message": f"Comparison complete: {diff_pixels} pixels differ ({percent_diff:.2f}%)",
    }
    if diff_image_path is not None:
        result["diff_image_path"] = diff_image_path

    print(json.dumps(result))

    # Exit 0 if identical, 1 if different
    sys.exit(0 if diff_pixels == 0 else 1)


if __name__ == "__main__":
    main()
`,
};

export function getCompareImagesSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-compare-images',
    description: 'Pixel-level image comparison utility. Compares two images and reports the percentage of differing pixels, optionally saving a visual diff image.',
    instructions: INSTRUCTIONS_BODY,
    license: 'MIT',
    compatibility: 'Requires uv (https://docs.astral.sh/uv/). Run scripts with: uv run scripts/compare_images.py',
    metadata: {
      author: 'openspec',
      version: '1.0',
    },
    scripts: SCRIPTS,
  };
}
