import type { BuildOptions } from 'vite';

export default {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: false,
  /** 单文件体积告警阈值（KB） */
  chunkSizeWarningLimit: 1500,
  rollupOptions: {
    output: {
      /** 依赖分包（Rolldown codeSplitting）：拆分 react / antd 相关三方库，避免业务与依赖混在同一 chunk */
      codeSplitting: {
        groups: [
          {
            name: 'react-vendor',
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          },
          {
            name: 'antd-vendor',
            test: /[\\/]node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+)[\\/]/,
          },
          {
            name: 'echarts-vendor',
            test: /[\\/]node_modules[\\/](echarts|echarts-for-react|zrender)[\\/]/,
          },
          {
            // Markdown 渲染链（消息详情、AI 回答复用），单独分包便于多页面共享缓存
            name: 'markdown-vendor',
            test: /[\\/]node_modules[\\/](react-markdown|remark-[^\\/]+|micromark[^\\/]*|mdast-util-[^\\/]+|mdast-[^\\/]+|unist-util-[^\\/]+|unified|vfile[^\\/]*)[\\/]/,
          },
        ],
      },
    },
  },
} as BuildOptions;
