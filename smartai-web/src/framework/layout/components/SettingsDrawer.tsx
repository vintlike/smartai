import { Button, ColorPicker, Drawer, Segmented, Switch, Tooltip } from 'antd'
import { Check, RefreshCw } from 'lucide-react'
import { layoutModes, themeColors, themeModes } from '../../config/theme'
import type { LayoutMode, ThemeMode } from '../../config/theme'
import { useI18n } from '../../i18n/I18nProvider'
import { useTheme } from '../../theme/ThemeProvider'
import { useLayout } from '../LayoutProvider'

/** 可选主题色：隐藏配置中标记为 disabled 的色板 */
const availableThemeColors = themeColors.filter((item) => !item.disabled)

/** 界面设置抽屉：主题、菜单模式、主题色、多标签页、语言 */
export function SettingsDrawer() {
  const { t, has, locale, setLocale, locales } = useI18n()
  const {
    mode,
    colorPrimary,
    setMode,
    setColorPrimary,
    reset: resetTheme,
  } = useTheme()
  const { settings, collapsed, setCollapsed, updateSettings, resetSettings, settingsOpen, closeSettings } =
    useLayout()

  const modeLabel = (key: string, fallback: string) => (has(key) ? t(key) : fallback)

  const handleReset = () => {
    resetSettings()
    resetTheme()
  }

  return (
    <Drawer
      className="sa-settings-drawer"
      title={t('layout.settings.title')}
      open={settingsOpen}
      onClose={closeSettings}
      size={332}
      extra={
        <Button type="text" size="small" icon={<RefreshCw size={14} />} onClick={handleReset}>
          {t('layout.settings.reset')}
        </Button>
      }
    >
      <section className="sa-settings-section">
        <h4>{t('layout.settings.themeMode')}</h4>
        <Segmented
          block
          value={mode}
          options={themeModes.map((item) => ({
            value: item.value,
            label: modeLabel(`layout.themeMode.${item.value}`, item.label),
          }))}
          onChange={(value) => setMode(value as ThemeMode)}
        />
      </section>

      <section className="sa-settings-section">
        <h4>{t('layout.settings.layoutMode')}</h4>
        <div className="sa-mode-list">
          {layoutModes.map((item) => (
            <button
              key={item.value}
              type="button"
              className={[
                'sa-mode-card',
                settings.layoutMode === item.value ? 'is-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => updateSettings({ layoutMode: item.value as LayoutMode })}
            >
              <span className={`sa-mode-preview sa-mode-preview--${item.value}`}>
                <span className="sa-mode-preview__top" />
                <span className="sa-mode-preview__side" />
                <span className="sa-mode-preview__body" />
              </span>
              <span>{modeLabel(`layout.layoutMode.${item.value}`, item.label)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sa-settings-section">
        <h4>{t('layout.settings.themeColor')}</h4>
        <div className="sa-color-list">
          {availableThemeColors.map((item) => {
            const active = item.color.toLowerCase() === colorPrimary.toLowerCase()
            return (
              <Tooltip
                key={item.color}
                title={`${item.title}${item.description ? ` · ${item.description}` : ''}`}
              >
                <button
                  type="button"
                  className={['sa-color-item', active ? 'is-active' : '']
                    .filter(Boolean)
                    .join(' ')}
                  style={{ background: item.color }}
                  disabled={item.disabled}
                  aria-label={item.title}
                  onClick={() => setColorPrimary(item.color)}
                >
                  {active ? <Check size={14} strokeWidth={3} color="#fff" /> : null}
                </button>
              </Tooltip>
            )
          })}
        </div>
        <div className="sa-color-custom">
          <span>{t('layout.settings.customColor')}</span>
          <ColorPicker
            value={colorPrimary}
            size="small"
            onChangeComplete={(color) => setColorPrimary(color.toHexString())}
          />
        </div>
        <p className="sa-settings-tip">{t('layout.settings.colorTip')}</p>
      </section>

      <section className="sa-settings-section">
        <h4>{t('layout.settings.interface')}</h4>
        <div className="sa-switch-row">
          <span>{t('layout.settings.tabs')}</span>
          <Switch
            size="small"
            checked={settings.showTabs}
            onChange={(checked) => updateSettings({ showTabs: checked })}
          />
        </div>
        <div className="sa-switch-row">
          <span>{t('layout.settings.breadcrumb')}</span>
          <Switch
            size="small"
            checked={settings.showBreadcrumb}
            onChange={(checked) => updateSettings({ showBreadcrumb: checked })}
          />
        </div>
        <div className="sa-switch-row">
          <span>{t('layout.header.collapse')}</span>
          <Switch size="small" checked={collapsed} onChange={setCollapsed} />
        </div>
      </section>

      <section className="sa-settings-section">
        <h4>{t('layout.settings.language')}</h4>
        <Segmented
          block
          value={locale}
          options={locales.map((item) => ({ value: item.value, label: item.label }))}
          onChange={(value) => setLocale(String(value))}
        />
      </section>
    </Drawer>
  )
}
