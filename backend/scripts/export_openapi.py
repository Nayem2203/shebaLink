"""Export or verify the FastAPI OpenAPI 3.1 contract stored at backend/openapi.json."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app  # noqa: E402

OPENAPI_OUTPUT_PATH = BACKEND_ROOT / "openapi.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Export or validate backend/openapi.json")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify backend/openapi.json matches the live FastAPI app schema.",
    )
    args = parser.parse_args()

    schema = app.openapi()
    rendered = json.dumps(schema, indent=2, sort_keys=True) + "\n"

    if args.check:
        if not OPENAPI_OUTPUT_PATH.exists():
            print(f"Missing OpenAPI spec at {OPENAPI_OUTPUT_PATH}")
            return 1
        current = OPENAPI_OUTPUT_PATH.read_text(encoding="utf-8").replace("\r\n", "\n")
        if current != rendered:
            print(
                f"OpenAPI spec drift detected in {OPENAPI_OUTPUT_PATH}. "
                "Run `python scripts/export_openapi.py` to regenerate."
            )
            return 1
        print(
            f"OpenAPI {schema.get('openapi')} check passed "
            f"({len(schema.get('paths', {}))} paths verified)."
        )
        return 0

    OPENAPI_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OPENAPI_OUTPUT_PATH.write_text(rendered, encoding="utf-8")
    print(
        f"Exported OpenAPI {schema.get('openapi')} spec to {OPENAPI_OUTPUT_PATH} "
        f"({len(schema.get('paths', {}))} paths)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
