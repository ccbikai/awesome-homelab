import fs from 'node:fs'
import path from 'node:path'
import yaml from 'yaml'
import { markdownTable } from 'markdown-table'

import { getYAMLFiles } from './yaml.js'
import { getBadge, getRepoInfo, getTitle, toPascalCase } from './utils.js'

const dataDir = './data'
const yamlFiles = getYAMLFiles(dataDir)

const categoryList = await Promise.all(
  yamlFiles
    .map((yamlFile) => {
      const filePath = path.join(dataDir, yamlFile)
      const data = fs.readFileSync(filePath, 'utf8')
      const apps = yaml.parse(data)
      return {
        apps,
        name: toPascalCase(yamlFile.replace('.yaml', '')),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(async (category) => {
      category.apps = await Promise.all(
        category.apps.map(async (project) => {
          project.info = await getRepoInfo(project.url)
          return project
        }),
      )
      category.apps = category.apps.sort((a, b) => b.info.stars - a.info.stars)
      console.info(category.name)
      console.table(category.apps)
      return category
    }),
)

const markdown = categoryList
  .map((category) => {
    const list = [['Name', 'Info', 'Description']].concat(
      category.apps.map(project => [
        getTitle(project),
        [
          getBadge(project, 'stars'),
          getBadge(project, 'language'),
          // getBadge(project, 'license')
        ].join(' '),
        project.description || project.info?.description,
      ]),
    )
    const appsMd = markdownTable(list)
    return `### ${category.name}\n\n${appsMd}`
  })
  .join('\n\n')

const readme = fs.readFileSync('./tmpl/README.md', 'utf8')

fs.writeFileSync('./README.md', readme.replace('<!-- Apps -->', markdown))
