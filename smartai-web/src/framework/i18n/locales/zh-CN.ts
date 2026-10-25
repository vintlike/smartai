import type { I18nMessages } from '../types';

const zhCN: I18nMessages = {
  common: {
    confirm: '确定',
    cancel: '取消',
    reset: '重置',
    empty: '暂无数据',
  },
  layout: {
    header: {
      settings: '界面设置',
      language: '切换语言',
      lightMode: '亮色模式',
      darkMode: '暗色模式',
      collapse: '收起菜单',
      expand: '展开菜单',
    },
    settings: {
      title: '界面设置',
      themeMode: '主题风格',
      layoutMode: '菜单模式',
      themeColor: '主题色',
      interface: '界面显示',
      tabs: '多标签页',
      breadcrumb: '面包屑',
      language: '语言',
      reset: '恢复默认',
      customColor: '自定义颜色',
      colorTip: '选中后立即生效，并自动记忆',
    },
    layoutMode: {
      vertical: '左侧菜单模式',
      horizontal: '顶部菜单模式',
      blend: '混合菜单模式',
    },
    themeMode: {
      light: '亮色风格',
      dark: '暗黑模式',
    },
    tabs: {
      refresh: '刷新',
      close: '关闭标签页',
      closeOthers: '关闭其它标签页',
      closeLeft: '关闭左侧标签页',
      closeRight: '关闭右侧标签页',
      closeAll: '关闭全部标签页',
      more: '标签页操作',
    },
    menu: {
      loading: '正在加载菜单…',
      error: '菜单加载失败',
      retry: '重新加载',
    },
    notFound: {
      title: '页面不存在',
      description: '访问的页面已被移除，或地址输入有误。',
      backHome: '返回首页',
    },
    missingComponent: {
      title: '未找到页面组件',
      description: '菜单 component 未匹配到 src/pages 下的页面文件：',
    },
  },
};

export default zhCN;
