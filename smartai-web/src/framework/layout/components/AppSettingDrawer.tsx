import { CheckOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ColorPicker, Divider, Drawer, Switch, Tooltip } from 'antd';
import { useI18n } from '../../i18n/I18nProvider';
import { colorPrimary as defaultColorPrimary, defaultThemeColors } from '../../theme/colors';
import { useThemeMode } from '../../theme/ThemeProvider';
import type { MenuMode } from '../../types';
import { useLayout } from '../AppLayoutProvider';

/** 菜单模式选项（与 types 中 MenuMode 保持一致） */
const modeOptions: MenuMode[] = ['vertical', 'horizontal', 'blend'];

export interface AppSettingDrawerProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

interface LayoutModePreviewProps {
  /** 菜单模式 */
  mode: MenuMode;
  /** 是否为当前选中项 */
  selected: boolean;
  /** 点击选中 */
  onSelect: () => void;
}

/** 布局模式缩略图：以结构示意直观预览三种菜单模式 */
function LayoutModePreview({ mode, selected, onSelect }: LayoutModePreviewProps) {
  const { t } = useI18n();
  const label = t(`menuMode.${mode}`);

  return (
    <Tooltip title={label}>
      <button
        type="button"
        className="app-layout-mode-item"
        aria-label={label}
        aria-pressed={selected}
        onClick={onSelect}
      >
        <span className={`app-layout-mode-thumb${selected ? ' is-selected' : ''}`}>
          {mode !== 'horizontal' ? <span className="preview-sider" /> : null}
          {mode === 'vertical' ? (
            <span className="preview-header-right" />
          ) : (
            <span className="preview-header-full" />
          )}
        </span>
        <span className="app-layout-mode-title">{label}</span>
      </button>
    </Tooltip>
  );
}

/**
 * 设置抽屉（右侧滑出）：展示平台设置。
 * 内置面板依次为 布局设置（缩略图切换菜单模式）、界面显示（页签/面包屑/页脚/水印）、
 * 主题设置（深色模式、主题色色板与自定义取色、灰色/色弱辅助模式），
 * 并提供「恢复默认设置」；业务可通过 config.settingsContent 覆盖为自定义内容。
 */
export function AppSettingDrawer({ open, onClose }: AppSettingDrawerProps) {
  const {
    config,
    menuMode,
    setMenuMode,
    showTabs,
    setShowTabs,
    showBreadcrumb,
    setShowBreadcrumb,
    showFooter,
    setShowFooter,
    showWatermark,
    setShowWatermark,
  } = useLayout();
  const {
    isDark,
    setThemeMode,
    themeColor,
    setThemeColor,
    greyMode,
    setGreyMode,
    weakMode,
    setWeakMode,
  } = useThemeMode();
  const { t } = useI18n();

  /** 业务自定义色板优先，缺省使用框架内置色板 */
  const colors = (config.themeColors ?? defaultThemeColors).filter((item) => !item.disabled);

  /** 恢复为配置声明的默认值（并清除对应的本地覆盖） */
  const resetSettings = () => {
    setMenuMode(config.menuMode ?? 'vertical');
    setShowTabs(config.showTabs ?? false);
    setShowBreadcrumb(config.showBreadcrumb ?? true);
    setShowFooter(config.showFooter ?? true);
    setShowWatermark(config.showWatermark ?? false);
    setThemeMode(config.defaultThemeMode ?? 'light');
    setThemeColor(config.colorPrimary ?? defaultColorPrimary);
    setGreyMode(false);
    setWeakMode(false);
  };

  return (
    <Drawer title={t('settings.title')} placement="right" size={320} open={open} onClose={onClose}>
      {config.settingsContent ?? (
        <div className="app-settings-panel">
          <Divider style={{ marginTop: 0 }}>{t('settings.layout')}</Divider>
          <div className="app-layout-mode-list">
            {modeOptions.map((mode) => (
              <LayoutModePreview
                key={mode}
                mode={mode}
                selected={menuMode === mode}
                onSelect={() => setMenuMode(mode)}
              />
            ))}
          </div>

          <Divider>{t('settings.interface')}</Divider>
          {/* 界面显示开关：即时生效并持久化到本地 */}
          <div className="app-settings-item">
            <span>{t('settings.showTabs')}</span>
            <Switch checked={showTabs} onChange={setShowTabs} aria-label={t('settings.showTabs')} />
          </div>
          <div className="app-settings-item">
            <span>{t('settings.showBreadcrumb')}</span>
            <Switch
              checked={showBreadcrumb}
              onChange={setShowBreadcrumb}
              aria-label={t('settings.showBreadcrumb')}
            />
          </div>
          <div className="app-settings-item">
            <span>{t('settings.showFooter')}</span>
            <Switch
              checked={showFooter}
              onChange={setShowFooter}
              aria-label={t('settings.showFooter')}
            />
          </div>
          <div className="app-settings-item">
            <span>{t('settings.showWatermark')}</span>
            <Switch
              checked={showWatermark}
              onChange={setShowWatermark}
              aria-label={t('settings.showWatermark')}
            />
          </div>

          <Divider>{t('settings.theme')}</Divider>
          {/* 深色模式：antd Switch 承载浅色/深色切换 */}
          <div className="app-settings-item">
            <span>{t('theme.darkMode')}</span>
            <Switch
              checked={isDark}
              onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              aria-label={t('theme.darkMode')}
            />
          </div>
          {/* 主题色：色板点击切换，勾选当前色 */}
          <div className="app-settings-block">
            <p className="app-settings-label">{t('settings.themeColor')}</p>
            <div className="app-theme-color-list">
              {colors.map((item) => (
                <Tooltip
                  key={item.color}
                  title={item.description ? `${item.title} · ${item.description}` : item.title}
                >
                  <button
                    type="button"
                    className={`app-theme-color-item${themeColor === item.color ? ' is-selected' : ''}`}
                    style={{ backgroundColor: item.color }}
                    aria-label={item.title}
                    aria-pressed={themeColor === item.color}
                    onClick={() => setThemeColor(item.color)}
                  >
                    {themeColor === item.color ? <CheckOutlined /> : null}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
          {/* 自定义主题色：任意取色，与预置色板共用持久化 */}
          <div className="app-settings-item">
            <span>{t('settings.customColor')}</span>
            <ColorPicker
              value={themeColor}
              onChangeComplete={(color) => setThemeColor(color.toHexString())}
            />
          </div>
          {/* 灰色 / 色弱辅助模式（整站滤镜，开关即时生效） */}
          <div className="app-settings-item">
            <span>{t('settings.greyMode')}</span>
            <Switch checked={greyMode} onChange={setGreyMode} aria-label={t('settings.greyMode')} />
          </div>
          <div className="app-settings-item">
            <span>{t('settings.weakMode')}</span>
            <Switch checked={weakMode} onChange={setWeakMode} aria-label={t('settings.weakMode')} />
          </div>

          <Button block style={{ marginTop: 24 }} onClick={resetSettings}>
            {t('settings.reset')}
          </Button>
        </div>
      )}
    </Drawer>
  );
}
