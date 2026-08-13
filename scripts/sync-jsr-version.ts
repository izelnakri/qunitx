#!/usr/bin/env node
// Copies package.json's version into deno.json.
//
// The two registries carry the same library from the same tree, so they have to agree on
// what version that tree is. npm reads package.json; JSR reads deno.json and rejects a
// version that already exists, so a stale number there fails the publish — after the npm
// half has already gone out.
//
// Wired to the `version` npm lifecycle script, which runs after `npm version` writes the
// new number and before `make release` commits, so the bump is a single step with nothing
// to remember. Run it directly to repair drift.
import { readFile, writeFile } from 'node:fs/promises';

const [pkg, deno] = await Promise.all([
  readFile('package.json', 'utf8').then(JSON.parse),
  readFile('deno.json', 'utf8').then(JSON.parse),
]);

if (deno.version === pkg.version) {
  console.log(`deno.json already at ${pkg.version}`);
} else {
  const previous = deno.version;
  deno.version = pkg.version;
  await writeFile('deno.json', JSON.stringify(deno, null, 2) + '\n');
  console.log(`deno.json ${previous} → ${pkg.version}`);
}
