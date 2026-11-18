import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

export default defineConfig({
  shortcuts: {
    center: 'flex items-center justify-center',
    itemCenter: 'absolute left-50% top-50% transform -translate-x-50% -translate-y-50%',
  },
  theme: {
    colors: {
      // 全部映射到 ThemeProvider 注入的 CSS 变量：切换主题色 / 暗色时原子类自动跟随
      primary: 'var(--app-color-primary, #409eff)',
      success: 'var(--app-color-success, #0ac17e)',
      danger: 'var(--app-color-error, #ff3c31)',
      warning: 'var(--app-color-warning, #fc8519)',
      info: 'var(--app-color-info, #72caed)',
      textColorPrimary: 'var(--app-color-text, #353535)',
      textColorRegular: 'var(--app-color-text-secondary, #666)',
      textColorSecondary: 'var(--app-color-text-tertiary, #999)',
      borderColor: 'var(--app-color-border-secondary, #f0f0f0)',
      titleColor: 'var(--app-color-text-secondary, #727272)',
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({ scale: 1.2, cdn: 'https://esm.sh/' }),
    presetTypography(),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives(), transformerAttributifyJsx()],
});
