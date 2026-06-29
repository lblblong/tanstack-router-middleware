import { createRoute, Link } from '@tanstack/react-router'
import { login, logout, isLoggedIn } from '../auth'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  context: () => ({ auth: false, title: '首页' }),
  component: () => (
    <div>
      <h1>首页</h1>
      <p>公开页面，无需登录</p>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/admin">进入控制台</Link>
        <Link to="/login">登录页</Link>
      </nav>
      <p>当前状态：{isLoggedIn() ? '已登录' : '未登录'}</p>
    </div>
  ),
})

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  context: () => ({ auth: false, title: '登录' }),
  component: () => (
    <div>
      <h1>登录</h1>
      <button type="button" onClick={() => login()}>
        模拟登录
      </button>
      <nav style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Link to="/">返回首页</Link>
        <Link to="/admin">进入控制台</Link>
      </nav>
    </div>
  ),
})

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  context: () => ({ auth: true, title: '控制台' }),
  component: () => (
    <div>
      <h1>控制台</h1>
      <p>需要登录才能访问</p>
      <button type="button" onClick={() => logout()}>
        退出登录
      </button>
      <nav style={{ marginTop: 12 }}>
        <Link to="/">返回首页</Link>
      </nav>
    </div>
  ),
})
