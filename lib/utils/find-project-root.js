import process from 'node:process';
import searchInParentDirectories from './search-in-parent-directories.js';

export default async function() {
  try {
    let absolutePath = await searchInParentDirectories('.', 'package.json');
    if (!absolutePath.includes('package.json')) {
      throw new Error('package.json mising');
    }

    return absolutePath.replace('/package.json', '');
  } catch (error) {
    console.log('couldnt find projects package.json, did you run $ npm init ??');
    process.exit(1);
  }
}

