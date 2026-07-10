import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  // 开发服务器代理配置，解决 CORS 跨域问题
  server: {
    proxy: {
      '/api': {
        target: 'http://81.71.75.85:6008',
        changeOrigin: true,
      },
      '/ai-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-api/, '/api'),
      },
    },
  },
  // 启动时预构建 TipTap，避免首次打开富文本编辑器时触发运行时 optimize 导致卡顿/刷新
  optimizeDeps: {
    include: [
      '@tiptap/vue-3',
      '@tiptap/starter-kit',
      '@tiptap/extension-text-align',
      '@tiptap/extension-text-style',
      '@tiptap/extension-underline',
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api']
      }
    }
  }
})
