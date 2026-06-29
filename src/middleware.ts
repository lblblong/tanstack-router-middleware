import type { ParsedLocation } from '@tanstack/react-router'

export interface MiddlewareContext<M extends {} = Record<string, any>> {
  to: ParsedLocation
  from?: ParsedLocation
  meta: M
  params: Record<string, string>
  search: Record<string, unknown>
  cause: 'preload' | 'enter' | 'stay'
}

export abstract class Middleware<M extends {} = Record<string, any>> {
  register(_ctx: MiddlewareContext<M>): boolean {
    return true
  }

  abstract handle(ctx: MiddlewareContext<M>, next: () => Promise<void>): Promise<void>
}

export function defineMiddleware<M extends {} = Record<string, any>>(def: {
  register?: (ctx: MiddlewareContext<M>) => boolean
  handle: (ctx: MiddlewareContext<M>, next: () => Promise<void>) => Promise<void>
}): Middleware<M> {
  return new class extends Middleware<M> {
    register(ctx: MiddlewareContext<M>) {
      return def.register ? def.register(ctx) : true
    }
    async handle(ctx: MiddlewareContext<M>, next: () => Promise<void>) {
      return def.handle(ctx, next)
    }
  }()
}
