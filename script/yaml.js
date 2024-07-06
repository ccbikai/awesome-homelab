import fs from 'fs';
import path from 'path';

export function getYAMLFiles(directory) {
  const files = fs.readdirSync(directory);
  const yamlFiles = files.filter(file => path.extname(file) === '.yaml');
  return yamlFiles;
}