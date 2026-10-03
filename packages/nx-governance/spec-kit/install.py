"""Pinned local-payload adapter; Spec Kit still owns installation and bundle records.

Use the Python environment containing the verified Spec Kit revision. Upstream's
default bundle adapter currently ignores local component sources (2026-10-03).
Remove this adapter once that path is supported and its conformance proofs pass.
"""
import argparse
import json
from pathlib import Path
import yaml
from specify_cli import get_speckit_version, workflow_add
from specify_cli.bundles.adapters import DefaultPrimitiveInstaller
from specify_cli.bundles.installer import install_bundle
from specify_cli.bundles.manifest import BundleManifest
from specify_cli.bundles.project import active_integration
from specify_cli.bundles.resolver import resolve_install_plan
from specify_cli.extensions import ExtensionManager
from specify_cli.presets import PresetManager


class LocalPayloadInstaller(DefaultPrimitiveInstaller):
    def __init__(self, base, manifest):
        super().__init__(allow_network=False)
        self.sources = {}
        # Preflight every source/pin before any install can modify the project.
        for component in manifest.components:
            source = (base / (component.source or "")).resolve()
            source.relative_to(base)
            if not component.source or component.kind == "steps":
                raise ValueError("This bundle requires explicit local extension/preset/workflow sources.")
            key = {"extensions": "extension", "presets": "preset", "workflows": "workflow"}[component.kind]
            data = yaml.safe_load((source / f"{key}.yml").read_text())
            if data[key]["id"] != component.id or data[key]["version"] != component.version:
                raise ValueError(f"Bundle pin/source conflict: {component.id}")
            self.sources[(component.kind, component.id)] = source

    def install(self, project_root, component):
        self._apply(project_root, component, False)

    def refresh(self, project_root, component):
        self._apply(project_root, component, True)

    def _apply(self, project_root, component, force):
        source = self.sources[(component.kind, component.id)]
        if component.kind == "workflows":
            # The official workflow CLI handles validation, registry and refresh.
            workflow_add(str(source), dev=True, from_url=None, version=None)
            return
        manager = ExtensionManager(project_root) if component.kind == "extensions" else PresetManager(project_root)
        existing = manager.registry.get(component.id) or {}
        priority = existing.get("priority", component.priority or 10)
        manager.install_from_directory(source, get_speckit_version(), priority=priority, force=force)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    project = Path.cwd().resolve()
    local = json.loads((project / ".specify/entif-governance.json").read_text())
    if local.get("branchPolicy") != "existing-authorized" or local.get("writerCount") != 1:
        raise ValueError("Run the Nx init generator with compatible local authority first.")
    if get_speckit_version() != "1.1.1.dev0":
        raise ValueError("Local adapter is verified with Spec Kit 1.1.1.dev0 at compatibility.json's commit only.")
    integration = active_integration(project)
    if integration is None:
        raise ValueError("Initialize Spec Kit with the consuming project's chosen integration first.")
    base = Path(__file__).resolve().parent
    manifest = BundleManifest.from_file(base / "bundle.yml")
    installer = LocalPayloadInstaller(base, manifest)
    plan = resolve_install_plan(manifest, speckit_version=get_speckit_version(), active_integration=integration)
    result = install_bundle(project, plan, installer, manifest=manifest, refresh=args.refresh)
    print(f"{result.bundle_id}: {len(result.installed)} installed, {len(result.skipped)} preserved, {len(result.refreshed)} refreshed")


if __name__ == "__main__":
    main()
