import hostedGitInfo from 'hosted-git-info'

export function toPascalCase(str) {
  return str
    .replace(/^\w|[A-Z]|\b\w/g, (word, index) => {
      return index === 0 ? word.toUpperCase() : word.toUpperCase()
    }).replace(/\s+/g, '').replace(/-/g, '')
}

export async function getRepoInfo(url) {
  const repo = hostedGitInfo.fromUrl(url)
  try {
    if (!repo) {
      const info = new URL(url)
      const [user, project] = info.pathname.slice(1).split('/')
      const res = await fetch(`${info.origin}/api/v4/projects/${encodeURIComponent(`${user}/${project}`)}`)
      const data = await res.json()
      return {
        type: 'gitlab',
        user,
        project,
        stars: data.star_count,
        description: data.description,
        language: data.language,
        topics: data.topics || [],
      }
    }
    if (repo.type === 'github') {
      const res = await fetch(`https://api.github.com/repos/${repo.user}/${repo.project}`, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      })
      const data = await res.json()
      return {
        type: 'github',
        user: repo.user,
        project: repo.project,
        stars: data.stargazers_count,
        description: data.description,
        language: data.language,
        topics: data.topics || [],
      }
    }
    if (repo.type === 'gitlab') {
      const res = await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(`${repo.user}/${repo.project}`)}`)
      const data = await res.json()
      return {
        type: 'gitlab',
        user: repo.user,
        project: repo.project,
        stars: data.star_count,
        description: data.description,
        language: data.language,
        topics: data.topics || [],
      }
    }
  }
  catch (e) {
    console.error(url, repo, e)
    return {}
  }

  return {}
}

export function getBadge(project, type) {
  if (project.info.type === 'github') {
    if (type === 'stars') {
      return `![${project.name}](https://img.shields.io/${project.info.type}/stars/${project.info.user}/${project.info.project}?style=flat)`
    }
    if (type === 'license') {
      return `![${project.name}](https://img.shields.io/${project.info.type}/license/${project.info.user}/${project.info.project}?style=flat)`
    }
    if (type === 'language') {
      return `![${project.name}](https://img.shields.io/${project.info.type}/languages/top/${project.info.user}/${project.info.project}?style=flat)`
    }
  }
  else if (project.info.type === 'gitlab') {
    const url = new URL(project.url)
    if (type === 'stars') {
      return `![${project.name}](https://img.shields.io/${project.info.type}/stars/${encodeURIComponent(`${project.info.user}/${project.info.project}`)}?style=flat&gitlab_url=${url.origin})`
    }
    if (type === 'license') {
      return `![${project.name}](https://img.shields.io/${project.info.type}/license/${encodeURIComponent(`${project.info.user}/${project.info.project}`)}?style=flat&gitlab_url=${url.origin})`
    }
    if (type === 'language') {
      return `![${project.name}](https://img.shields.io/${project.info.type}/languages/count/${encodeURIComponent(`${project.info.user}/${project.info.project}`)}?style=flat&gitlab_url=${url.origin})`
    }
  }
  else {
    return ''
  }
}

export function getTitle(project) {
  return `[${project.name}](${project.url})`
}
