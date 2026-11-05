#!/usr/bin/env python3
"""Validate this editorial's source package without third-party dependencies.

Run from any directory. This complements, rather than replaces, the site's
Astro/Nx build. It never contacts a network or changes publication status.
"""
from __future__ import annotations
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import sys

SUPPORT = Path(__file__).resolve().parent
CONTENT = SUPPORT.parent.parent
ARTICLE = CONTENT / "articles/i-paid-for-an-argument.md"

def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)

def main() -> int:
    text = ARTICLE.read_text(encoding="utf-8")
    require(text.startswith("---\n"), "Missing frontmatter")
    frontmatter, body = text[4:].split("\n---\n", 1)
    meta = json.loads(frontmatter)  # JSON is the YAML subset used by this entry.
    require(re.fullmatch(r"entif\.[a-z0-9.-]+", meta["id"]) is not None, "Invalid id")
    slug = r"[a-z0-9]+(?:-[a-z0-9]+)*"
    require(re.fullmatch(slug, meta["slug"]) is not None, "Invalid slug")
    require(3 <= len(meta["title"]) <= 100, "Invalid title length")
    require(20 <= len(meta["description"]) <= 220, "Invalid description length")
    require(meta["kind"] == "essay", "Unexpected publication kind")
    require(meta["status"] == "draft" and meta["noindex"] is True, "Release gate changed")
    dt.date.fromisoformat(meta["published"])
    require(bool(meta["authors"]) and all(isinstance(x, str) and x for x in meta["authors"]), "Missing author")
    for field in ("tags", "projects"):
        require(all(re.fullmatch(slug, x) is not None for x in meta[field]), f"Invalid {field}")
    require(meta["routeTag"] in meta["tags"] + meta["projects"], "routeTag must occur in tags or projects")
    require(all(isinstance(x, str) and x for x in meta["sourceRefs"]), "Invalid sourceRefs")
    chapters = re.findall(r"^## (\d+)\. (.+)$", body, re.M)
    require([int(n) for n, _ in chapters] == list(range(1, 15)), "Missing or unordered chapters")
    definitions = re.findall(r"^\[\^([a-z0-9]+)\]:", body, re.M)
    references = re.findall(r"\[\^([a-z0-9]+)\](?!:)", body)
    require(len(definitions) == len(set(definitions)), "Duplicate source definitions")
    require(set(references) == set(definitions), "Unresolved or unused source note")
    require(len(set(definitions)) == 32, "Unexpected source-note count")
    require(len(meta["sourceRefs"]) == len(definitions), "Metadata source map differs")
    prose = body.split("## Evidence and source notes", 1)[0]
    require(len(prose.split()) > 18000, "Manuscript unexpectedly truncated")
    require("And I would like my fucking argument." in prose, "Missing ending")
    require("External Reddit case" in body and "separate person's account" in body, "Third-party attribution lost")
    require("security thought reinforcement" in body, "Missing mechanism discussion")
    sources = json.loads((SUPPORT / "sources.json").read_text(encoding="utf-8"))["sources"]
    require(len(sources) == 24, "Unexpected research-source count")
    require(len({s["id"] for s in sources}) == len(sources), "Duplicate research source")
    forbidden = ("socr8s/private-ip", "file://", "sandbox:", "/mnt/data/", "chatgpt.com/backend-api/", "drive.google.com/")
    public_files = [ARTICLE, SUPPORT / "README.md", SUPPORT / "sources.json", SUPPORT / "evidence-notes.md"]
    for path in public_files:
        content = path.read_text(encoding="utf-8")
        require(not any(value in content for value in forbidden), f"Private/internal locator in {path.name}")
        require("\u2014" not in content, f"Em dash in {path.name}")
    manifest_path = SUPPORT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for item in manifest["files"]:
        path = (CONTENT / item["path"]).resolve()
        require(path.is_relative_to(CONTENT.resolve()), "Manifest path escapes content directory")
        raw = path.read_bytes()
        require(len(raw) == item["bytes"], f"Size drift: {item['path']}")
        require(hashlib.sha256(raw).hexdigest() == item["sha256"], f"Hash drift: {item['path']}")
    print(json.dumps({"status": "PASS", "chapters": len(chapters), "source_notes": len(definitions), "research_sources": len(sources), "files_hashed": len(manifest["files"]), "site_build": "separate verification", "publication_status": meta["status"]}, indent=2))
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
