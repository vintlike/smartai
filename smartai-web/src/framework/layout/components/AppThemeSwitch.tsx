import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useI18n } from '../../i18n/I18nProvider';
import { useThemeMode } from '../../theme/ThemeProvider';

/** 浅色/深色主题快速切换按钮（完整设置见 AppSettingDrawer） */
export function AppThemeSwitch() {
  const { isDark, toggleTheme } = useThemeMode();
  const { t } = useI18n();

  /** 提示即将切换到的主题 */
  const label = t(isDark ? 'theme.toLight' : 'theme.toDark');

  return (
    <Tooltip title={label}>
      <Button
        type="text"
        size="small"
        aria-label={label}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
      />
    </Tooltip>
  );
}
