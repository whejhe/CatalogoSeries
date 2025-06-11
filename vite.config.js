import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Eliminamos additionalData para usar @use en cada archivo SCSS/Vue SFC
        // Esto soluciona la advertencia de depreciación de @import.
        // Ahora tendremos que añadir @use en cada fichero .scss o <style lang="scss">
      },
    },
  },
})
