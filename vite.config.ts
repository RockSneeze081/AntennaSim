import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built assets resolve correctly under GitHub Pages'
  // project-site subpath (https://<user>.github.io/<repo>/) regardless of repo name.
  base: './',
  plugins: [react()],
})
