import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
  .trim().split(/\r?\n/).filter((file, index, all) => file && all.indexOf(file) === index);
const failures = [];
for (const file of files) {
  if (!/\.(ts|js|mjs|html|json|md|ya?ml|css)$/.test(file)) continue;
  let contents;
  try { contents = await readFile(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  // Never print matched values; only paths. Do not mistake fake test tokens for credentials.
  if (/eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}/.test(contents) ||
      /(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/.test(contents)) failures.push(file);
}
if (failures.length) {
  console.error('Credential-like values found in: ' + failures.join(', '));
  process.exitCode = 1;
} else console.log('Source and generated files: no embedded JWT/GitHub credentials detected.');
