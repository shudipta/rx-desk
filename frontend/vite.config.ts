import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/health': 'http://localhost:8080',
      '/stats': 'http://localhost:8080',
      '/patients': 'http://localhost:8080',
      '/prescriptions': 'http://localhost:8080',
      '/doctor': 'http://localhost:8080',
      '/favorite-medicines': 'http://localhost:8080',
      '/favorite-tests': 'http://localhost:8080',
      '/advice-templates': 'http://localhost:8080',
      '/followup-templates': 'http://localhost:8080',
      '/clinical-templates': 'http://localhost:8080',
    },
  },
})
