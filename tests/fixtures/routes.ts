import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  context: () => ({ auth: false, title: '首页' }),
  component: () => null,
})

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  context: () => ({ auth: false, title: '登录' }),
  component: () => null,
})

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  context: () => ({ auth: true, title: '控制台' }),
  component: () => null,
})
