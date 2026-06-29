import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'
import { setLoggedIn } from './fixtures/auth'

beforeAll(() => {
  Object.defineProperty(window, 'scrollTo', {
    value: () => {},
    writable: true,
  })
})

afterEach(() => {
  cleanup()
  setLoggedIn(false)
})
