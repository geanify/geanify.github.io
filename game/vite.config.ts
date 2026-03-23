import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../',
    emptyOutDir: false, // CRITICAL: false to prevent Vite from deleting the game folder and .git
  }
})
