import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Bump this when releasing an update – it shows at the bottom of Settings.
const APP_VERSION = '1.19'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(APP_VERSION) },
})
