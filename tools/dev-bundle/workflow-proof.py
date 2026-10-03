"""Exercise the pinned upstream engine; emulate only the external agent boundary."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from specify_cli.integrations import get_integration
from specify_cli.workflows.base import RunStatus
from specify_cli.workflows.engine import WorkflowDefinition, WorkflowEngine

ROOT = Path(__file__).resolve().parents[2]
COMPONENTS = ROOT / "packages/nx-governance/spec-kit"
WORKFLOW = json.loads((COMPONENTS / "workflow/workflow.yml").read_text())
HOOKS = json.loads((COMPONENTS / "extension/extension.yml").read_text())["hooks"]


class WorkflowProof(unittest.TestCase):
    def exercise(self, follow_hooks=False, fail_first=False, human_gate=False):
        with tempfile.TemporaryDirectory(prefix="entif-workflow-") as temporary:
            root = Path(temporary)
            log = root / "events.jsonl"
            gate = root / "gate.py"
            gate.write_text(
                "import json,pathlib,sys\n"
                "root=pathlib.Path(__file__).parent\n"
                "with (root/'events.jsonl').open('a') as f: f.write(json.dumps(sys.argv[1:])+'\\n')\n"
                "sys.exit(1 if sys.argv[1]=='shell' and not (root/'ready').exists() else 0)\n"
            )
            definition = copy.deepcopy(WORKFLOW)
            for step in definition["steps"]:
                if step.get("type") == "shell":
                    # Preserve the real upstream shell boundary, replace only Nx with a bounded recorder.
                    step["run"] = f'"{sys.executable}" "{gate}" shell {step["id"]}'
            if human_gate:
                definition["inputs"]["review"] = {"type": "string", "default": ""}
                definition["steps"].insert(2, {"id": "review", "type": "gate", "message": "Review evidence",
                    "verdict_input": "review", "on_reject": "abort"})
            if not fail_first:
                (root / "ready").touch()
            commands = []

            def dispatch(command, **_):
                commands.append(command)
                if follow_hooks:
                    stage = command.removeprefix("speckit.")
                    for event in (f"before_{stage}", f"after_{stage}"):
                        if event in HOOKS:
                            subprocess.run([sys.executable, str(gate), "hook", event], check=True)
                return {"exit_code": 0, "stdout": "fixture command complete", "stderr": ""}

            integration = get_integration("codex")
            engine = WorkflowEngine(root)
            parsed = WorkflowDefinition(definition)
            self.assertEqual(engine.validate(parsed), [])
            with patch.object(integration, "dispatch_command", side_effect=dispatch), \
                 patch("specify_cli.workflows.step.command.shutil.which", return_value=sys.executable), \
                 patch("specify_cli.extensions.HookExecutor.execute_hook", side_effect=AssertionError("Engine unexpectedly invoked hooks")):
                state = engine.execute(parsed, {"spec": "fixture", "integration": "codex", "project": "fixture-governance"})
                if fail_first:
                    self.assertEqual(state.status, RunStatus.FAILED)
                    self.assertEqual(commands, ["speckit.specify"])
                    self.assertEqual(state.current_step_id, "specify-admission")
                    (root / "ready").touch()
                    state = engine.resume(state.run_id)
                if human_gate:
                    self.assertEqual(state.status, RunStatus.PAUSED)
                    self.assertEqual(commands, ["speckit.specify"])
                    state = engine.resume(state.run_id, {"review": "approve"})
                self.assertEqual(state.status, RunStatus.COMPLETED)
            self.assertEqual(commands, ["speckit.specify", "speckit.plan", "speckit.tasks", "speckit.implement", "speckit.converge"])
            events = [json.loads(line) for line in log.read_text().splitlines()]
            self.assertEqual(len([event for event in events if event[0] == "shell"]), 6 if fail_first else 5)
            self.assertEqual(len([event for event in events if event[0] == "hook"]), 8 if follow_hooks else 0)
            persisted = root / ".specify/workflows/runs" / state.run_id / "state.json"
            self.assertEqual(json.loads(persisted.read_text())["status"], "completed")

    def test_shell_gates_execute_without_agent_hook_compliance(self):
        self.exercise()

    def test_compliant_agent_hooks_and_shell_steps_both_execute(self):
        self.exercise(follow_hooks=True)

    def test_failed_admission_resumes_at_gate_without_repeating_completed_command(self):
        self.exercise(fail_first=True)

    def test_upstream_human_gate_pauses_and_resumes(self):
        self.exercise(human_gate=True)


if __name__ == "__main__":
    unittest.main()
