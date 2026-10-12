"""Real pinned-runtime install/refresh proof; no LLM compliance claim."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument('bundle', type=Path)
args = parser.parse_args()
bundle = args.bundle.resolve()
specify = os.environ.get('SPECIFY_BIN', str(Path(sys.executable).with_name('specify')))

def run(command, cwd, fail=False):
    result = subprocess.run(command, cwd=cwd, capture_output=True, text=True, timeout=120)
    if (result.returncode == 0) == fail:
        raise AssertionError(f'{command}\n{result.stdout}\n{result.stderr}')
    return result.stdout

with tempfile.TemporaryDirectory(prefix='entif-veneer-') as temporary:
    for runtime in ('codex', 'claude', 'generic'):
        project = Path(temporary) / runtime
        project.mkdir()
        command = [specify, 'init', '--here', '--integration', runtime, '--ignore-agent-tools', '--non-interactive', '--force']
        if runtime == 'generic': command += ['--integration-options', '--commands-dir .specify/runtime-commands']
        run(command, project)
        (project / '.specify/entif-governance.json').write_text(json.dumps({'branchPolicy': 'existing-authorized', 'writerCount': 1}))
        install = [sys.executable, str(bundle / 'install.py')]
        if runtime == 'generic': install += ['--meta-skill']
        run(install, project)
        # #1701 force-refresh overwrote these edits; this assertion fails before #1710.
        location = {'codex': '.agents/skills/speckit-rosetta-governance-admit/SKILL.md',
                    'claude': '.claude/skills/speckit-rosetta-governance-admit/SKILL.md',
                    'generic': '.specify/runtime-commands/speckit.rosetta-governance.admit.md'}[runtime]
        veneer = project / location
        original = veneer.read_bytes()
        veneer.write_bytes(original + b'\nLocal customization must survive.\n')
        modified = veneer.read_bytes()
        run(install + ['--refresh'], project, fail=True)
        assert veneer.read_bytes() == modified
        veneer.write_bytes(original)
        manifest_file = project / '.specify/managed-veneers.json'
        manifest = json.loads(manifest_file.read_text())
        assert manifest['resolved']['speckit']['commit'] == 'de0cbd762e2d0b30f90d3ffcbe2ee9d7167f4eda'
        assert manifest['compatibility']['speckit'] != manifest['resolved']['speckit']['version']
        assert location in manifest['files']
        assert manifest['files'][location]['sha256'] == hashlib.sha256(original).hexdigest()
        run(install + ['--refresh'], project)
        assert json.loads(manifest_file.read_text()) == manifest
        assert veneer.read_bytes() == original
        # Installed payload edits and independently changed identities block before any refresh.
        payload = project / '.specify/extensions/rosetta-governance/commands/admit.md'
        source = payload.read_bytes(); edited_payload = source + b'\nLocal payload edit.\n'; payload.write_bytes(edited_payload)
        run(install + ['--refresh'], project, fail=True)
        assert payload.read_bytes() == edited_payload
        payload.write_bytes(source)
        registry = project / '.specify/extensions/.registry'
        saved_registry = registry.read_text(); changed = json.loads(saved_registry)
        changed['extensions']['rosetta-governance']['version'] = '9.0.0'; registry.write_text(json.dumps(changed))
        run(install + ['--refresh'], project, fail=True)
        registry.write_text(saved_registry)
        run(install + ['--check'], project)
        if runtime == 'generic':
            eager = list((project / '.agents/skills').glob('*/SKILL.md'))
            assert [file.parent.name for file in eager] == ['entif-development']
            parent = eager[0].read_text()
            assert '--route' in parent
            route = run(install + ['--route', 'baseline'], project)
            baseline = project / '.specify/runtime-commands/speckit.rosetta-governance.baseline.md'
            assert route == baseline.read_text()
            assert 'Preserve structured' not in route
            run(install + ['--route', '../unknown'], project, fail=True)
        print(f'{runtime}: exact provenance, local edits/identity protected, reproducible refresh' + ('; one eager parent and selected-file route' if runtime == 'generic' else ''))
