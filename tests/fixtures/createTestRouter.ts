import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { setLoggedIn } from './auth'
import { adminRoute, indexRoute, loginRoute } from './routes'
import { rootRoute } from './root'

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, adminRoute])

export function createTestRouter(options?: {
  loggedIn?: boolean
  history?: RouterHistory
}) {
  if (options?.loggedIn !== undefined) {
    setLoggedIn(options.loggedIn)
  }

  return createRouter({
    routeTree,
    context: { auth: false },
    history: options?.history,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createTestRouter>
  }
}
