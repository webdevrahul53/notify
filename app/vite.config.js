import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load .env files based on the current `mode`
  const env = loadEnv(mode, __dirname, '')

  const appenv = env.VITE_APP_ENV || 'quality'

  const portDetails = {
    quality: Number(env.VITE_APP_PORT_QAS),
    production: Number(env.VITE_APP_PORT_PRD)
  }

  return {
    plugins: [react()],
    server: {
      port: portDetails[appenv] || 3042,
      host: true
    }
  }
})