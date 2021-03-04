import fs from 'fs/promises';

process.env['FORCE_COLOR'] = 0;

await fs.mkdir('./tmp/test', { recursive: true });
