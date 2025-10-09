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
    parentPath?: string
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
    let parentPath: string | undefined

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
      // Handle files in subdirectories
      const dirSegments = dirName.split(path.sep)
      const isLayoutFile = fileName === dirSegments[dirSegments.length - 1]

      if (isLayoutFile) {
        // This is a layout file: teams/teams.tsx -> /teams (layout)
        // or a7k9m2x5p8w1n4q6r3y8b5t1/teams/teams.tsx -> /a7k9m2x5p8w1n4q6r3y8b5t1/teams (layout)
        routePath = '/' + dirSegments.join('/')
        isLayout = true

        // If this is nested (e.g., a7k9m2x5p8w1n4q6r3y8b5t1/teams), set parent
        if (dirSegments.length > 1) {
          parentPath = '/' + dirSegments.slice(0, -1).join('/')
        }
      } else if (fileName.includes('.')) {
        // Handle flat route naming in subdirectories: teams.new.tsx -> teams/new
        const segments = fileName.split('.')
        const baseSegment = segments[0]
        const parentDirPath = '/' + dirName.replace(/\//g, '/')

        if (fileName === baseSegment) {
          // This shouldn't happen with the layout check above, but just in case
          routePath = parentDirPath + '/' + baseSegment
        } else {
          // This is a child route
          const childPath = segments
            .slice(1)
            .join('/')
            .replace(/\$([^/]+)/g, ':$1')

          // Special handling for _index
          if (childPath === '_index') {
            routePath = parentDirPath + '::index' // Use special marker for index routes
            parentPath = parentDirPath
          } else {
            routePath = parentDirPath + '::' + childPath
            parentPath = parentDirPath
          }
        }
      } else if (fileName === '_index') {
        // Handle folder-based routing: users/_index.tsx -> /users (index)
        routePath = '/' + dirName
      } else if (fileName.startsWith('$')) {
        // Handle folder-based dynamic routes: users/$userId.tsx -> /users/:userId
        const paramName = fileName.substring(1) // Remove the $
        routePath = '/' + dirName + '/:' + paramName
      } else {
        // Simple file in subdirectory: resources/somefile -> /resources/somefile
        routePath = '/' + dirName + '/' + fileName
      }
    }

    routeMap[routePath] = {
      file: `routes/${file}`,
      isLayout,
      parentPath,
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
      // Calculate the relative path for nested layouts
      let finalPath = routePath
      if (routeInfo.parentPath) {
        // Make the path relative to the parent
        finalPath = routePath.replace(routeInfo.parentPath, '').replace(/^\//, '')
      }

      const route: RouteEntry = {
        path: finalPath,
        file: routeInfo.file,
        children: [],
      }
      layoutRoutes[routePath] = route

      // If this layout has a parent, add it as a child of the parent
      if (routeInfo.parentPath && layoutRoutes[routeInfo.parentPath]) {
        layoutRoutes[routeInfo.parentPath].children!.push(route)
      } else if (!routeInfo.parentPath) {
        // Top-level layout
        routes.push(route)
      }
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

  // Third pass: handle orphaned layout routes (layouts that weren't added to parents)
  Object.entries(routeMap).forEach(([routePath, routeInfo]) => {
    if (
      routeInfo.isLayout &&
      routeInfo.parentPath &&
      !layoutRoutes[routeInfo.parentPath]
    ) {
      // Parent doesn't exist as a layout, add this as a top-level route
      const existingRoute = layoutRoutes[routePath]
      if (existingRoute && !routes.includes(existingRoute)) {
        routes.push(existingRoute)
      }
    }
  })

  return routes
}

export const createFlatRoutes = (): RouteEntry[] => scanFlatRoutes()
