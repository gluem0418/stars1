import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import glsl from 'vite-plugin-glsl';

import { templateCompilerOptions } from '@tresjs/core'

import * as path from 'path';

export default defineConfig({
  base: '/ppap/', //追加
  plugins: [
    vue({
      // template: {
      //   compilerOptions: {
      //     isCustomElement: (tag) =>
      //       tag.startsWith('Tres') && tag !== 'TresCanvas',
      //   }
      // }
      ...templateCompilerOptions,
    }),
    glsl(),
  ],
  define: { 'process.env': {} },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
  },
})