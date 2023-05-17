import fs from 'node:fs/promises';

export default async function pathExists(path) {
  try {
    await fs.access(path);

    return true;
  } catch {
    return false;
  }
}
