import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
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
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
