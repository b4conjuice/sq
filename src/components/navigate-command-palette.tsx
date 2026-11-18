import { useLocation, useNavigate, useRouter } from '@tanstack/react-router'

import CommandPalette from '@/components/command-palette'
import type { Command } from '@/components/command-palette'
import { useRegisteredNavigateCommands } from '@/components/navigate-command-palette-provider'
import { routeTree } from '@/routeTree.gen'

function normalizePath(path: string) {
  if (path === '/') {
    return path
  }
  return path.replace(/\/+$/, '') || '/'
}

function getRoutes(route: typeof routeTree): string[] {
  const routes = [
    route.fullPath,
    ...Object.values(route.children ?? {})
      .map(child => child.fullPath)
      .filter(
        path =>
          normalizePath(path) !== '/' &&
          path.split('/').filter(Boolean).length === 1
      ),
  ]
  return [...new Set(routes.map(normalizePath))]
}

export default function NavigateCommandPalette({
  commands: pageCommands,
  showLaunchButton,
}: {
  commands?: Command[]
  showLaunchButton?: boolean
}) {
  const registeredCommands = useRegisteredNavigateCommands()
  const location = useLocation()
  const currentPath = normalizePath(location.pathname)
  const navigate = useNavigate()
  const router = useRouter()
  const routes = getRoutes(routeTree)
  const navigateRoutesCommands: Command[] = routes
    .filter(route => route !== currentPath)
    .map(route => {
      const name = route === '/' ? 'home' : route.replaceAll('/', '')
      return {
        id: `go-${name}`,
        title: `go ${name}`,
        subtitle: route,
        keywords: [route, name],
        action: () => {
          navigate({
            to: route,
          })
        },
      }
    })
  const defaultCommands: Command[] = [
    ...navigateRoutesCommands,
    {
      id: 'go-back',
      title: 'go back',
      subtitle: 'previous page',
      keywords: ['back', 'history', 'previous'],
      action: () => {
        router.history.back()
      },
    },
  ]

  return (
    <CommandPalette
      toggleIsOpenHotKey='N'
      placeholder='navigate to'
      showLaunchButton={showLaunchButton}
      commands={[
        ...(pageCommands ?? []),
        ...registeredCommands,
        ...defaultCommands,
      ]}
    />
  )
}
