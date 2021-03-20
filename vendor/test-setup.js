import fs from 'fs/promises';

process.env['FORCE_COLOR'] = 0;

await fs.rmdir('./tmp', { recursive: true });
await fs.mkdir('./tmp/test', { recursive: true });
