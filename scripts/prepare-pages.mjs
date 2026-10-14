import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(root, 'dist/justwatch2/browser');
const destination = resolve(root, 'docs');
const html = await readFile(resolve(source, 'index.html'), 'utf8');
const licenses = await readFile(resolve(source, '../3rdpartylicenses.txt'), 'utf8');
if (!html.includes('<base href="/justwatch2/">')) throw new Error('Pages build must use /justwatch2/ as base href.');
if (!destination.startsWith(root) || !source.startsWith(root) || destination !== resolve(root, 'docs')) {
  throw new Error('Build destination must stay inside this repository.');
}
// docs is exclusively generated output for the existing master:/docs Pages site.
await rm(destination + sep, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await writeFile(resolve(destination, '3rdpartylicenses.txt'), licenses);
await writeFile(resolve(destination, '.nojekyll'), '');
await writeFile(resolve(destination, '404.html'), html);
console.log('Pages bundle ready in docs/ (hash routes, no server required).');
