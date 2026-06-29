import { render, waitFor } from '@testing-library/react'
import { createMemoryHistory, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { cancel, createRootRouteWithMiddleware, Middleware, type MiddlewareContext } from 'tanstack-router-middleware'
import { createTestRouter } from './fixtures/createTestRouter'
import type { AppRouterContext } from './fixtures/types'

describe('AuthMiddleware', () => {
  it('未登录访问受保护路由时，cancel 会重定向到 defaultCancelPath', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin'] })
    const router = createTestRouter({ loggedIn: false, history })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
  })

  it('已登录可以访问受保护路由', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin'] })
    const router = createTestRouter({ loggedIn: true, history })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/admin')
    })
  })

  it('公开路由不会触发鉴权中间件', async () => {
    const history = createMemoryHistory({ initialEntries: ['/login'] })
    const router = createTestRouter({ loggedIn: false, history })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
  })

  it('从公开页跳转到受保护路由时，cancel 会回到上一个成功访问的页面', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const router = createTestRouter({ loggedIn: false, history })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })

    await router.navigate({ to: '/admin' })

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })
  })

  it('子路由 context.auth 会覆盖 root 默认值', async () => {
    const history = createMemoryHistory({ initialEntries: ['/admin'] })
    const router = createTestRouter({ loggedIn: true, history })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      const match = router.state.matches.at(-1)
      expect(match?.context.auth).toBe(true)
      expect(match?.context.title).toBe('控制台')
    })
  })
})

describe('next() 洋葱模型', () => {
  function createOnionRouter(options: {
    middlewares: Middleware<AppRouterContext>[]
    history: ReturnType<typeof createMemoryHistory>
  }) {
    const rootRoute = createRootRouteWithMiddleware<AppRouterContext>({
      middlewares: options.middlewares,
      defaultCancelPath: '/login',
      component: () => <Outlet />,
    })
    // 每次创建新的子路由实例，确保 getParentRoute 绑定到当前 rootRoute
    const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => null })
    const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: () => null })
    const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: () => null })
    const routeTree = rootRoute.addChildren([indexRoute, loginRoute, adminRoute])
    return createRouter({ routeTree, context: { auth: false }, history: options.history })
  }

  it('多个 middleware 按顺序执行，next() 后的代码在后续 middleware 完成后运行', async () => {
    const log: string[] = []

    class FirstMiddleware extends Middleware<AppRouterContext> {
      async handle(_ctx: MiddlewareContext<AppRouterContext>, next: () => Promise<void>) {
        log.push('first:before')
        await next()
        log.push('first:after')
      }
    }

    class SecondMiddleware extends Middleware<AppRouterContext> {
      async handle(_ctx: MiddlewareContext<AppRouterContext>, next: () => Promise<void>) {
        log.push('second:before')
        await next()
        log.push('second:after')
      }
    }

    const history = createMemoryHistory({ initialEntries: ['/'] })
    const router = createOnionRouter({ middlewares: [new FirstMiddleware(), new SecondMiddleware()], history })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })

    expect(log).toEqual([
      'first:before',
      'second:before',
      'second:after',
      'first:after',
    ])
  })

  it('未显式调用 next() 时，链路在此终止，后续 middleware 不执行', async () => {
    const secondFn = vi.fn()

    class FirstMiddleware extends Middleware<AppRouterContext> {
      async handle() {
        // 不调用 next()，链路终止
      }
    }

    class SecondMiddleware extends Middleware<AppRouterContext> {
      async handle(_ctx: MiddlewareContext<AppRouterContext>, next: () => Promise<void>) {
        secondFn()
        await next()
      }
    }

    const history = createMemoryHistory({ initialEntries: ['/'] })
    const router = createOnionRouter({ middlewares: [new FirstMiddleware(), new SecondMiddleware()], history })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })

    expect(secondFn).not.toHaveBeenCalled()
  })

  it('第一个 middleware 中断后，后续 middleware 不执行', async () => {
    const secondFn = vi.fn()

    // 两个 middleware 都只在 /admin 上注册，这样 cancel 跳走后恢复导航时两者都不会触发
    class BlockingMiddleware extends Middleware<AppRouterContext> {
      register(ctx: MiddlewareContext<AppRouterContext>) {
        return ctx.to.pathname === '/admin'
      }
      async handle() {
        throw cancel()
      }
    }

    class SecondMiddleware extends Middleware<AppRouterContext> {
      register(ctx: MiddlewareContext<AppRouterContext>) {
        return ctx.to.pathname === '/admin'
      }
      async handle(_ctx: MiddlewareContext<AppRouterContext>, next: () => Promise<void>) {
        secondFn()
        await next()
      }
    }

    const history = createMemoryHistory({ initialEntries: ['/admin'] })
    const router = createOnionRouter({ middlewares: [new BlockingMiddleware(), new SecondMiddleware()], history })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })

    expect(secondFn).not.toHaveBeenCalled()
  })
})
