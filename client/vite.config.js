import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Option 1: Allow all hosts (simplest for quick testing)
    allowedHosts: true,
    
    // OR Option 2: Specify the exact tunnel URL
    // allowedHosts: ['your-random-name.trycloudflare.com']
  }
})
