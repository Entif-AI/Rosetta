"""Evidence and overwrite safety around upstream-owned runtime generation."""
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import tempfile
import yaml
from specify_cli import get_speckit_version
from specify_cli.agents import CommandRegistrar
from specify_cli.integrations import INTEGRATION_REGISTRY
from specify_cli.integrations.manifest import IntegrationManifest

MANIFEST = '.specify/managed-veneers.json'
PARENT = '.agents/skills/entif-development/SKILL.md'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def safe(root, relative):
    rel = Path(relative)
    if rel.is_absolute() or '..' in rel.parts:
        raise ValueError(f'Non-local managed path: {relative}')
    current = root
    for part in rel.parts:
        current = current / part
        if current.is_symlink():
            raise ValueError(f'Managed path follows a symlink: {relative}')
    current.resolve().relative_to(root.resolve())
    return current


def tree_digest(root):
    return sha(json.dumps({file.relative_to(root).as_posix(): sha(file.read_bytes())
                           for file in sorted(root.rglob('*')) if file.is_file()}, sort_keys=True).encode())


def resolved_cli(compatibility):
    try:
        direct = json.loads(importlib.metadata.distribution('specify-cli').read_text('direct_url.json') or '{}')
    except (ValueError, importlib.metadata.PackageNotFoundError) as error:
        raise ValueError('Cannot verify Spec Kit PEP 610 Git provenance; reinstall the exact pin.') from error
    expected = compatibility['verifiedUpstream']
    repository = direct.get('url', '').removesuffix('.git')
    commit = direct.get('vcs_info', {}).get('commit_id')
    if repository != expected['repository'] or commit != expected['commit']:
        raise ValueError('Spec Kit installed source does not match the exact verified Git pin (PEP 610).')
    return {'repository': repository, 'commit': commit, 'version': get_speckit_version()}


class ManagedVeneers:
    def __init__(self, project, base, integration, manifest, installer):
        self.project, self.base, self.integration = project, base, integration
        self.bundle, self.installer = manifest, installer
        self.compatibility = json.loads((base / 'compatibility.json').read_text())
        self.cli = resolved_cli(self.compatibility)
        file = safe(project, MANIFEST)
        self.previous = json.loads(file.read_text()) if file.exists() else None
        if self.previous and (self.previous.get('formatVersion') != 1 or self.previous.get('integration') != integration or
                              not isinstance(self.previous.get('files'), dict)):
            raise ValueError('Managed veneer manifest identity/schema conflict; reconcile before refresh.')
        self.parent_source = sha((base / 'meta-skill/SKILL.md').read_bytes())
        self.components = {
            component.id: {'kind': component.kind, 'version': component.version, 'sourceRef': component.source,
                           'sourceSha256': tree_digest(installer.sources[(component.kind, component.id)])}
            for component in manifest.components
        }

    def check(self):
        if not self.previous:
            raise ValueError('No managed veneer baseline; install or reconcile the legacy installation first.')
        self.verify_installed()
        results = {}
        for relative, record in self.previous['files'].items():
            file = safe(self.project, relative)
            current = sha(file.read_bytes()) if file.is_file() else None
            if not isinstance(record, dict) or not isinstance(record.get('sha256'), str) or len(record['sha256']) != 64:
                raise ValueError('Malformed managed veneer digest.')
            results[relative] = {'sha256': current, 'modificationStatus': 'unchanged' if current == record['sha256'] else 'modified-or-missing'}
        return results

    def preflight(self, refresh, meta_skill):
        if meta_skill and (self.integration != 'generic' or
                           self.runtime_directory() != self.project / '.specify/runtime-commands'):
            raise ValueError('Meta-Skill route requires generic flat commands in .specify/runtime-commands.')
        core = IntegrationManifest.load(self.integration, self.project)
        known = set(self.previous['files']) if self.previous else set(core.files) if core else set()
        for component, kind, command, file in self.commands():
            relative = file.relative_to(self.project).as_posix()
            if file.exists() and relative not in known:
                raise ValueError(f'Unmanaged command collision; preserve before installation: {relative}')
        if meta_skill: safe(self.project, PARENT)
        if self.previous:
            changed = [file for file, result in self.check().items() if result['modificationStatus'] != 'unchanged']
            if changed:
                raise ValueError(f'Local managed edits/deletions require review before overwrite: {changed}')
            if not refresh and (self.previous['components'] != self.components or self.previous.get('parentSourceSha256') != self.parent_source):
                raise ValueError('Component source/pins changed; review and use --refresh explicitly.')
            self.verify_installed()
        else:
            # Never bless an existing payload as pristine merely because it is readable.
            for component in self.bundle.components:
                if safe(self.project, f'.specify/{component.kind}/{component.id}').exists():
                    raise ValueError('Legacy bundle has no per-file baseline; stage a clean pinned install and reconcile before adoption.')
            core = IntegrationManifest.load(self.integration, self.project)
            if core is None or core.version != self.cli['version'] or core.recovered_files:
                raise ValueError('A pristine upstream integration manifest is required for first install.')
            for relative, expected in core.files.items():
                file = safe(self.project, relative)
                if not file.is_file() or sha(file.read_bytes()) != expected:
                    raise ValueError(f'Core generated file was locally modified before install: {relative}')
            if meta_skill and safe(self.project, PARENT).exists():
                raise ValueError('Unmanaged Meta-Skill parent already exists; preserve and reconcile it.')

    def verify_installed(self):
        if not self.previous: raise ValueError('No recorded installed identity.')
        for id, record in self.previous['components'].items():
            if record['kind'] == 'workflows':
                registry = json.loads(safe(self.project, '.specify/workflows/workflow-registry.json').read_text())['workflows']
            else:
                registry = json.loads(safe(self.project, f".specify/{record['kind']}/.registry").read_text())[record['kind']]
            if registry.get(id, {}).get('version') != record['version']:
                raise ValueError(f'Installed component identity changed independently: {id}')
        if self.previous['resolved']['speckit'] != self.cli:
            raise ValueError('Installed CLI identity changed; explicit migration/reconciliation required.')

    def runtime_directory(self):
        config = CommandRegistrar(self.project).AGENT_CONFIGS[self.integration]
        return safe(self.project, Path(config['dir']).relative_to(self.project).as_posix()
                    if Path(config['dir']).is_absolute() else config['dir'])

    def commands(self):
        runtime = self.runtime_directory()
        extension = CommandRegistrar(self.project).AGENT_CONFIGS[self.integration]['extension']
        for component in self.bundle.components:
            if component.kind == 'workflows': continue
            kind = 'extension' if component.kind == 'extensions' else 'preset'
            source = self.installer.sources[(component.kind, component.id)]
            data = yaml.safe_load((source / f'{kind}.yml').read_text())
            commands = data.get('provides', {}).get('commands', []) if kind == 'extension' else [entry for entry in data.get('provides', {}).get('templates', []) if entry['type'] == 'command']
            for command in commands:
                name = command['name']
                filename = name.replace('.', '-') + extension if extension == '/SKILL.md' else name + extension
                file = safe(self.project, (runtime / filename).relative_to(self.project).as_posix())
                yield component, kind, command, file

    def record(self, meta_skill):
        files, routes = {}, {}
        templates = INTEGRATION_REGISTRY[self.integration].shared_templates_dir()
        core_source = {'component': 'github/spec-kit', 'version': self.cli['version'],
                       'sourceRef': f"{self.cli['repository']}@{self.cli['commit']}:core_pack/templates",
                       'sourceSha256': tree_digest(templates)}

        def record_file(file, owner, source_ref, sources=None):
            relative = file.relative_to(self.project).as_posix()
            checked = safe(self.project, relative)
            files[relative] = {'owner': owner, 'sourceRef': source_ref, 'sha256': sha(checked.read_bytes()),
                               'sources': sources or [self.components[owner]], 'modificationStatus': 'unchanged'}

        core = IntegrationManifest.load(self.integration, self.project)
        for relative in core.files:
            record_file(safe(self.project, relative), 'github/spec-kit', core_source['sourceRef'], [core_source])
        for component in self.bundle.components:
            installed = safe(self.project, f'.specify/{component.kind}/{component.id}')
            for file in sorted(installed.rglob('*')):
                if file.is_file():
                    record_file(file, component.id, f"bundle:{component.source}/{file.relative_to(installed).as_posix()}" if (self.installer.sources[(component.kind, component.id)] / file.relative_to(installed)).is_file() else f"bundle:{component.source}/{component.kind[:-1]}.yml")
        # Use upstream registration/config; share canonical command content across runtimes.
        for component, kind, command, file in self.commands():
            if not file.is_file(): raise ValueError(f"Upstream did not register expected command: {command['name']}")
            sources = [self.components[component.id]]
            if kind == 'preset': sources = [core_source, *sources]
            record_file(file, component.id, f"bundle:{component.source}/{command['file']}", sources)
            routes[command['name'].rsplit('.', 1)[-1]] = file.relative_to(self.project).as_posix()
        for relative in core.files:
            file = Path(relative)
            name = file.parent.name.removeprefix('speckit-') if file.name == 'SKILL.md' else file.stem.removeprefix('speckit.')
            if name not in routes and name != 'taskstoissues': routes[name] = relative
        if meta_skill or self.previous and PARENT in self.previous['files']:
            parent = safe(self.project, PARENT)
            parent.parent.mkdir(parents=True, exist_ok=True)
            parent.write_bytes((self.base / 'meta-skill/SKILL.md').read_bytes())
            files[PARENT] = {'owner': 'entif-development', 'sourceRef': 'bundle:meta-skill/SKILL.md',
                             'sha256': sha(parent.read_bytes()), 'sources': [{'version': self.bundle.bundle.version,
                             'sourceSha256': sha(parent.read_bytes())}], 'modificationStatus': 'unchanged'}
        result = {'formatVersion': 1, 'role': 'generated-evidence-not-authority', 'integration': self.integration,
                  'compatibility': self.compatibility, 'resolved': {'speckit': self.cli, 'bundleVersion': self.bundle.bundle.version},
                  'components': self.components, 'parentSourceSha256': self.parent_source, 'files': dict(sorted(files.items())), 'routes': dict(sorted(routes.items()))}
        destination = safe(self.project, MANIFEST)
        fd, temporary = tempfile.mkstemp(dir=destination.parent, prefix='.managed-veneers-')
        try:
            with os.fdopen(fd, 'w') as handle:
                json.dump(result, handle, indent=2, sort_keys=True); handle.write('\n'); handle.flush(); os.fsync(handle.fileno())
            os.replace(temporary, destination)
        finally:
            Path(temporary).unlink(missing_ok=True)

    def route(self, capability):
        if not self.previous or capability not in self.previous.get('routes', {}):
            raise ValueError('Unknown capability; use a recorded canonical route.')
        relative = self.previous['routes'][capability]
        self.verify_installed()
        file = safe(self.project, relative)
        if not file.is_file() or sha(file.read_bytes()) != self.previous['files'][relative]['sha256']:
            raise ValueError('Selected veneer changed; reconcile before loading.')
        return safe(self.project, relative).read_text()
