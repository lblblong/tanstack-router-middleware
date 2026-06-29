import {
  cancel,
  Middleware,
  type MiddlewareContext,
} from 'tanstack-router-middleware'
import { isLoggedIn } from './auth'
import type { AppRouterContext } from './types'

export class AuthMiddleware extends Middleware<AppRouterContext> {
  register(ctx: MiddlewareContext<AppRouterContext>) {
    return !!ctx.meta.auth
  }

  async handle(_ctx: MiddlewareContext<AppRouterContext>, next: () => Promise<void>) {
    if (!isLoggedIn()) {
      throw cancel()
    }
    await next()
  }
}
