import { Button, Dropdown, Tooltip } from 'antd'
import { Check, Languages, Moon, Settings, Sun } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useTheme } from '../../theme/ThemeProvider'
import { useLayout } from '../LayoutProvider'

/** 顶栏右侧动作区：语言、主题、界面设置 */
export function HeaderActions() {
  const { t, locale, setLocale, locales } = useI18n()
  const { mode, toggleMode } = useTheme()
  const { openSettings } = useLayout()

  const languageItems = locales.map((item) => ({
    key: item.value,
    label: item.label,
    icon: item.value === locale ? <Check size={14} /> : <span style={{ width: 14 }} />,
  }))

  return (
    <div className="sa-header-actions">
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{
          items: languageItems,
          selectedKeys: [locale],
          onClick: ({ key }) => setLocale(key),
        }}
      >
        <Tooltip title={t('layout.header.language')} placement="bottom">
          <Button
            type="text"
            className="sa-icon-btn"
            aria-label={t('layout.header.language')}
            icon={<Languages size={18} />}
          />
        </Tooltip>
      </Dropdown>

      <Tooltip
        title={mode === 'dark' ? t('layout.header.lightMode') : t('layout.header.darkMode')}
        placement="bottom"
      >
        <Button
          type="text"
          className="sa-icon-btn"
          aria-label={mode === 'dark' ? t('layout.header.lightMode') : t('layout.header.darkMode')}
          onClick={toggleMode}
          icon={mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        />
      </Tooltip>

      <Tooltip title={t('layout.header.settings')} placement="bottom">
        <Button
          type="text"
          className="sa-icon-btn sa-icon-btn--settings"
          aria-label={t('layout.header.settings')}
          onClick={openSettings}
          icon={<Settings size={18} />}
        />
      </Tooltip>
    </div>
  )
}
