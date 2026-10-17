// Vite resuelve los imports y el servidor de desarrollo.
// - plugin-vue: compila los componentes .vue (SFC).
// - tailwindcss: genera el CSS de utilidades bajo demanda.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),tailwindcss()],
})
