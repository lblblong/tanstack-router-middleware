import { createRootRouteWithMiddleware } from 'tanstack-router-middleware'
import { Outlet } from '@tanstack/react-router'
import { AuthMiddleware } from '../middleware/AuthMiddleware'
import type { AppRouterContext } from '../types'

export const rootRoute = createRootRouteWithMiddleware<AppRouterContext>({
  middlewares: [new AuthMiddleware()],
  defaultCancelPath: '/login',
  context: () => ({ auth: false }),
  component: () => <Outlet />,
})
