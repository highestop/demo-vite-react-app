import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // our 'index.html' is in src folder, not default project root folder. Noted that environment meta providers are also in root folder.
  root: 'src',
  // build outdir is same as root by default, but we want to keep it in root project root folder, so this is relative to root.
  build: {
    outDir: '../dist'
  },
  // use relative path to import files such as assets. Absolute '/' by default.
  base: './',
  server: {
    https: true,
  },
  plugins: [reactRefresh()],
  /**
   * [plugin:vite:css] '~antd/dist/antd.less' wasn't found.
   * less import no support webpack alias '~'
   *
   * Ref: https://github.com/vitejs/vite/issues/2185#issuecomment-784637827
   */
  resolve: {
    alias: [{ find: /^~/, replacement: '' }],
  },

  /**
   * [plugin:vite:css] Inline JavaScript is not enabled. Is it set in your options?
   *
   * Ref:
   * - https://blog.csdn.net/baobao_123456789/article/details/113986961
   * - https://stackoverflow.com/questions/46729091/enable-inline-javascript-in-less
   */
  css: {
    modules: {
      // auto translate css module class names into camelCase.
      localsConvention: 'camelCaseOnly'
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
