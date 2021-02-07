import searchInParentDirectories from './search-in-parent-directories.js';

export default async function() {
  return (await searchInParentDirectories('.', 'package.json')).replace('/package.json', '');
}

