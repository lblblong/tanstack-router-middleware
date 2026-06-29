import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { setLoggedIn } from './auth'
import { rootRoute } from './routes/__root'
import { adminRoute, indexRoute, loginRoute } from './routes/index'

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, adminRoute])

export function createAppRouter(options?: {
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
    router: ReturnType<typeof createAppRouter>
  }
}

export { routeTree }
