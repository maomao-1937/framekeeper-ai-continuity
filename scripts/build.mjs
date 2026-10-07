import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const files = ['index.html', 'app.js', 'core.js', 'sample.js', 'styles.css', 'favicon.svg'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist);
for (const file of files) await cp(join(root, file), join(dist, file));
console.log(`Built ${files.length} static files in dist/.`);
