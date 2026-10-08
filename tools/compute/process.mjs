import { spawn } from 'node:child_process';
import { ComputeError } from './contract.mjs';
import { writeSync } from 'node:fs';

// Separate process groups bound descendants as well as the SSH/Node parent.
export function terminate(child, signal = 'SIGTERM') {
  if (!child.pid) return;
  try { process.kill(-child.pid, signal); } catch { try { child.kill(signal); } catch { /* Already exited. */ } }
}
export function execute(executable, args, { input = '', cwd, env = process.env, timeoutMs = 15000, maxBytes = 1024 * 1024, logFd, signal } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd, env, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', bytes = 0, reason, killTimer;
    const stop = code => { reason ??= code; terminate(child); killTimer ??= setTimeout(() => terminate(child, 'SIGKILL'), 2000); };
    const timer = setTimeout(() => stop('TIMEOUT'), timeoutMs);
    const abort = () => stop('CANCELLED');
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const capture = destination => data => {
      const remaining = Math.max(0, maxBytes - bytes);
      bytes += data.length;
      const bounded = data.subarray(0, remaining);
      if (logFd !== undefined) {
        try { if (bounded.length && writeSync(logFd, bounded) !== bounded.length) stop('LOG_IO'); }
        catch { stop('LOG_IO'); }
      } else if (destination === 'stdout') stdout += bounded.toString(); else stderr += bounded.toString();
      if (bytes > maxBytes) stop('OUTPUT_LIMIT');
    };
    child.stdout?.on('data', capture('stdout')); child.stderr?.on('data', capture('stderr'));
    child.stdin.on('error', () => {}); child.stdin.end(input);
    child.on('error', error => { clearTimeout(timer); clearTimeout(killTimer); signal?.removeEventListener('abort', abort); reject(new ComputeError('TASK_EXECUTION', 'Executable is unavailable.', { executable: executable.split('/').at(-1), error: error.code })); });
    child.on('close', (exitCode, exitSignal) => {
      clearTimeout(timer); clearTimeout(killTimer); signal?.removeEventListener('abort', abort);
      resolve({ exitCode, exitSignal, stdout, stderr, reason });
    });
  });
}
