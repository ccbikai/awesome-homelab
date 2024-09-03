import fs from 'node:fs'
import path from 'node:path'

export function getYAMLFiles(directory) {
  const files = fs.readdirSync(directory)
  const yamlFiles = files.filter(file => path.extname(file) === '.yaml')
  return yamlFiles
}
