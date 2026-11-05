#!/usr/bin/env python3
"""Verify VER-ROSETTA-INTEROP-TRACE-0001 without a Rosetta checkout.

This verifier is deliberately narrow. It reproduces the current Rosetta fixture's
canonical body and CID construction for JSON values used by this fixture, checks
parent references, validates the detached Ed25519 Receipt signature, and, when
`jsonschema` is installed, validates the outer experiment transport schema.

It is an interoperability-fixture verifier, not a Rosetta conformance suite and
not a VER scientific validator.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
from pathlib import Path
from typing import Any


def canonical_json(value: Any) -> str:
    # For this fixture all numbers are integers. This deliberately avoids
    # claiming a complete independent implementation of RFC 8785 number rules.
    def reject_float(v: Any) -> None:
        if isinstance(v, float):
            raise ValueError("Fixture verifier refuses floats; use canonical Rosetta tooling for general JCS numbers.")
        if isinstance(v, list):
            for x in v:
                reject_float(x)
        elif isinstance(v, dict):
            for x in v.values():
                reject_float(x)

    reject_float(value)
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def content_id(canonical: str) -> str:
    return "cidv1-sha256-" + hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def tile_hashed_body(tile: dict[str, Any]) -> dict[str, Any]:
    return {
        "kind": tile["kind"],
        "pack": tile["pack"],
        "parents": sorted(tile["parents"]),
        "payload": tile["payload"],
        "version": tile["version"],
    }


def verify_schema(document: dict[str, Any], schema_path: Path) -> list[str]:
    try:
        import jsonschema  # type: ignore
    except ImportError:
        return ["SKIP: jsonschema package not installed; outer transport schema not checked."]

    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    try:
        jsonschema.validate(document, schema)
        return []
    except Exception as exc:
        return [f"Schema validation failed: {exc}"]


def verify_signature(document: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    signed = document["signedReceipt"]
    receipt = signed["receipt"]
    signature = signed["signature"]

    if signature["signedCid"] != receipt["cid"]:
        errors.append("Signature signedCid does not match Receipt CID.")
        return errors

    try:
        from cryptography.hazmat.primitives import serialization  # type: ignore
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey  # type: ignore
    except ImportError:
        return ["SKIP: cryptography package not installed; Ed25519 signature not checked."]

    try:
        public_key = serialization.load_pem_public_key(signature["publicKeyPem"].encode("utf-8"))
        if not isinstance(public_key, Ed25519PublicKey):
            errors.append("Receipt public key is not Ed25519.")
            return errors
        public_key.verify(
            base64.b64decode(signature["signatureBase64"]),
            receipt["cid"].encode("utf-8"),
        )
    except Exception as exc:
        errors.append(f"Ed25519 signature verification failed: {exc}")
    return errors


def verify(trace_path: Path, schema_path: Path) -> tuple[list[str], list[str]]:
    document = json.loads(trace_path.read_text(encoding="utf-8"))
    errors: list[str] = []
    notes: list[str] = []

    schema_messages = verify_schema(document, schema_path)
    for message in schema_messages:
        if message.startswith("SKIP:"):
            notes.append(message)
        else:
            errors.append(message)

    tiles = document["tiles"]
    by_cid = {tile["cid"]: tile for tile in tiles}
    if len(by_cid) != len(tiles):
        errors.append("Duplicate Tile CID found in tiles array.")

    for index, tile in enumerate(tiles):
        body = tile_hashed_body(tile)
        expected_canonical = canonical_json(body)
        expected_cid = content_id(expected_canonical)
        if tile["canonical"] != expected_canonical:
            errors.append(f"Tile {index} canonical mismatch: {tile['cid']}")
        if tile["cid"] != expected_cid:
            errors.append(f"Tile {index} CID mismatch: declared={tile['cid']} expected={expected_cid}")
        for parent in tile["parents"]:
            if parent not in by_cid:
                errors.append(f"Tile {tile['cid']} references missing parent {parent}")

    role_index = document["roleIndex"]
    for role, cid in role_index.items():
        if cid not in by_cid:
            errors.append(f"roleIndex[{role!r}] references missing CID {cid}")

    traversal = document["expectedTraversal"]
    for cid in traversal:
        if cid not in by_cid:
            errors.append(f"expectedTraversal references missing CID {cid}")

    receipt_bundle = document["receiptBundle"]
    for cid in receipt_bundle["closureCids"]:
        if cid not in by_cid:
            errors.append(f"Receipt bundle closure references missing CID {cid}")

    receipt_cid = document["roleIndex"]["receipt"]
    if document["receiptBundle"]["receiptCid"] != receipt_cid:
        errors.append("Receipt bundle receiptCid does not match roleIndex receipt.")

    signed_receipt = document["signedReceipt"]["receipt"]
    if signed_receipt != by_cid.get(receipt_cid):
        errors.append("signedReceipt.receipt is not byte-structurally equal to the Receipt in tiles.")

    signature_messages = verify_signature(document)
    for message in signature_messages:
        if message.startswith("SKIP:"):
            notes.append(message)
        else:
            errors.append(message)

    return errors, notes


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("trace", nargs="?", default="interop-trace-0001.json")
    parser.add_argument("--schema", default="interop-trace-0001.schema.json")
    args = parser.parse_args()

    errors, notes = verify(Path(args.trace), Path(args.schema))
    for note in notes:
        print(note)
    if errors:
        print(f"FAIL: {len(errors)} verification error(s)")
        for error in errors:
            print(f"- {error}")
        return 1

    print("PASS: transport schema (when dependency available), Tile canonical bodies/CIDs, parent references, role/traversal/closure references, and Ed25519 Receipt signature are consistent.")
    print("NOTE: this proves fixture integrity only. It does not prove Rosetta conformance generally or VER scientific correctness.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
