import { glob } from 'glob'
import path from 'path'

type RouteEntry = {
  path?: string
  file: string
  index?: boolean
  children?: RouteEntry[]
}

type RouteMap = {
  [routePath: string]: {
    file: string
    isLayout?: boolean
  }
}

export function scanFlatRoutes(): RouteEntry[] {
  const routesDir = path.join(process.cwd(), 'app/routes')

  // Find all .tsx files in routes directory and subdirectories
  const files = glob.sync('**/*.{ts,tsx}', {
    cwd: routesDir,
    ignore: ['**/*.test.*', '**/*.spec.*', '**/.*'],
  })

  const routeMap: RouteMap = {}

  files.forEach(file => {
    const filePath = file.replace(/\.(ts|tsx)$/, '')
    const fileName = path.basename(filePath)
    const dirName = path.dirname(file)

    // Skip files that start with underscore (except _index)
    if (fileName.startsWith('_') && fileName !== '_index') {
      return
    }

    let routePath = ''
    let isLayout = false

    // Handle root level files
    if (dirName === '.') {
      if (fileName === '_index') {
        routePath = '/'
      } else if (fileName === '$') {
        routePath = '*'
      } else if (fileName.includes('.')) {
        // Handle flat route naming: teams.new -> /teams/new
        // Special handling for favicon route
        if (fileName.includes('[.]')) {
          routePath = '/' + fileName.replace(/\[/g, '').replace(/\]/g, '')
        } else {
          routePath = '/' + fileName.replace(/\./g, '/').replace(/\$([^/]+)/g, ':$1')
        }
      } else {
        // Handle simple files: about -> /about
        routePath = '/' + fileName
      }
    } else {
      // Handle files in subdirectories with flat naming
      if (fileName.includes('.')) {
        const segments = fileName.split('.')
        const baseSegment = segments[0]

        // Check if this is a layout file (e.g., teams.tsx where fileName="teams" has no dots)
        // Layout files don't have additional dots beyond the base name
        if (fileName === baseSegment) {
          routePath = '/' + baseSegment
          isLayout = true
        } else {
          // This is a child route
          const parentPath = '/' + baseSegment
          const childPath = segments
            .slice(1)
            .join('/')
            .replace(/\$([^/]+)/g, ':$1')

          // Special handling for _index
          if (childPath === '_index') {
            routePath = parentPath + '::index' // Use special marker for index routes
          } else {
            routePath = parentPath + '::' + childPath
          }
        }
      } else {
        // Files without dots in subdirectories
        if (dirName === fileName) {
          // This is a layout file: teams/teams.tsx -> /teams (layout)
          routePath = '/' + fileName
          isLayout = true
        } else {
          // Simple file in subdirectory: resources/somefile -> /resources/somefile
          routePath = '/' + dirName + '/' + fileName
        }
      }
    }

    routeMap[routePath] = {
      file: `routes/${file}`,
      isLayout,
    }
  })

  // Convert routeMap to RouteEntry array with proper nesting
  return buildNestedRoutes(routeMap)
}

function buildNestedRoutes(routeMap: RouteMap): RouteEntry[] {
  const routes: RouteEntry[] = []
  const layoutRoutes: { [key: string]: RouteEntry } = {}

  // First pass: create layout routes
  Object.entries(routeMap).forEach(([routePath, routeInfo]) => {
    if (routeInfo.isLayout) {
      const route: RouteEntry = {
        path: routePath,
        file: routeInfo.file,
        children: [],
      }
      layoutRoutes[routePath] = route
      routes.push(route)
    } else if (!routePath.includes('::')) {
      // Regular non-nested routes
      routes.push({
        path: routePath,
        file: routeInfo.file,
      })
    }
  })

  // Second pass: add child routes to layouts
  Object.entries(routeMap).forEach(([routePath, routeInfo]) => {
    if (routePath.includes('::')) {
      const [parentPath, childPath] = routePath.split('::')
      const parentRoute = layoutRoutes[parentPath]

      if (parentRoute && parentRoute.children) {
        if (childPath === 'index') {
          parentRoute.children.push({
            index: true,
            file: routeInfo.file,
          })
        } else {
          parentRoute.children.push({
            path: childPath,
            file: routeInfo.file,
          })
        }
      } else {
        // No layout found - create as a regular nested route
        const [fallbackParentPath, fallbackChildPath] = routePath.split('::')
        routes.push({
          path: fallbackParentPath + '/' + fallbackChildPath,
          file: routeInfo.file,
        })
      }
    }
  })

  return routes
}

export const createFlatRoutes = (): RouteEntry[] => scanFlatRoutes()
