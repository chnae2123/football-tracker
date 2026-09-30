import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Served from https://chnae2123.github.io/football-tracker/
  base: '/football-tracker/',
  plugins: [react(), tailwindcss()],
})
