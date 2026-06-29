import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 开发 / 测试时直接指向库源码，改库代码无需先 build
      'tanstack-router-middleware': path.resolve(rootDir, '../../src/index.ts'),
    },
  },
})
