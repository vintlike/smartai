import { CheckOutlined, MoonOutlined, ReloadOutlined, SunOutlined } from '@ant-design/icons';
import { App, Button, Card, ColorPicker, Segmented, Switch, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import PageContainer from '@/components/PageContainer';
import type { Locale, MenuMode } from '@/framework';
import { defaultThemeColors, useI18n, useLayout, useThemeMode } from '@/framework';

const menuModeOptions: { label: string; value: MenuMode }[] = [
  { label: '左侧菜单', value: 'vertical' },
  { label: '顶部菜单', value: 'horizontal' },
  { label: '混合菜单', value: 'blend' },
];

const localeOptions: { label: string; value: Locale }[] = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];

interface SettingRowProps {
  title: string;
  description?: string;
  control: ReactNode;
}

/** 单条设置的标题 + 说明 + 右侧控件 */
function SettingRow({ title, description, control }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-solid border-[var(--ant-color-border-secondary)] py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="text-14px text-[var(--ant-color-text)]">{title}</div>
        {description && (
          <div className="mt-1 text-12px text-[var(--ant-color-text-tertiary)]">{description}</div>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

/**
 * 平台设置：与顶部「设置」抽屉共用同一份运行时偏好（写入 localStorage），
 * 覆盖旧项目布局设置中的菜单模式、面包屑、多页签、页脚、水印与主题、语言配置。
 */
export default function SystemConfig() {
  const { message } = App.useApp();
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
  const { locale, setLocale } = useI18n();

  const themeColors = (config.themeColors ?? defaultThemeColors).filter((item) => !item.disabled);

  const resetSettings = () => {
    setMenuMode(config.menuMode ?? 'vertical');
    setShowTabs(config.showTabs ?? true);
    setShowBreadcrumb(config.showBreadcrumb ?? true);
    setShowFooter(config.showFooter ?? true);
    setShowWatermark(config.showWatermark ?? false);
    setThemeMode(config.defaultThemeMode ?? 'light');
    setThemeColor(config.colorPrimary ?? '#415fff');
    setGreyMode(false);
    setWeakMode(false);
    setLocale('zh-CN');
    message.success('已恢复默认设置');
  };

  return (
    <PageContainer
      title="平台设置"
      contentBordered={false}
      extra={
        <Button onClick={resetSettings} icon={<ReloadOutlined />}>
          恢复默认设置
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="布局设置" className="rounded-12px">
          <SettingRow
            title="菜单模式"
            description="左侧菜单适合多级业务，顶部菜单适合页面较少时使用。"
            control={
              <Segmented<MenuMode>
                size="small"
                value={menuMode}
                options={menuModeOptions}
                onChange={setMenuMode}
              />
            }
          />
          <SettingRow
            title="显示页签栏"
            description="在内容区顶部保留已访问页面的多标签，可快速切换与关闭。"
            control={<Switch checked={showTabs} onChange={setShowTabs} />}
          />
          <SettingRow
            title="显示面包屑"
            description="在顶栏展示当前页面所在的菜单层级路径。"
            control={<Switch checked={showBreadcrumb} onChange={setShowBreadcrumb} />}
          />
          <SettingRow
            title="显示页脚"
            description="页面底部的版权与备案信息区域。"
            control={<Switch checked={showFooter} onChange={setShowFooter} />}
          />
          <SettingRow
            title="显示水印"
            description="内容区叠加半透明水印，用于内部系统的安全标识。"
            control={<Switch checked={showWatermark} onChange={setShowWatermark} />}
          />
        </Card>

        <Card title="主题设置" className="rounded-12px">
          <SettingRow
            title="深色模式"
            description="整体切换为暗色配色，适合夜间或长时间使用。"
            control={
              <Switch
                checked={isDark}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
              />
            }
          />
          <SettingRow
            title="灰色模式"
            description="按主题色饱和度自适应调整，常用于哀悼日等场景。"
            control={<Switch checked={greyMode} onChange={setGreyMode} />}
          />
          <SettingRow
            title="色弱模式"
            description="降低色彩干扰，提升色弱用户的辨识度。"
            control={<Switch checked={weakMode} onChange={setWeakMode} />}
          />
          <div className="py-3">
            <div className="text-14px text-[var(--ant-color-text)]">主题色</div>
            <div className="mt-1 text-12px text-[var(--ant-color-text-tertiary)]">
              用于按钮、链接、选中态等主色，支持自定义取色。
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {themeColors.map((item) => (
                <Tooltip key={item.color} title={item.title}>
                  <button
                    type="button"
                    aria-label={item.title}
                    aria-pressed={themeColor === item.color}
                    className="h-7 w-7 cursor-pointer rounded-6px border-0 p-0 text-white"
                    style={{ backgroundColor: item.color }}
                    onClick={() => setThemeColor(item.color)}
                  >
                    {themeColor === item.color ? <CheckOutlined /> : null}
                  </button>
                </Tooltip>
              ))}
              <ColorPicker
                value={themeColor}
                onChangeComplete={(color) => setThemeColor(color.toHexString())}
              />
            </div>
          </div>
        </Card>

        <Card title="语言设置" className="rounded-12px">
          <SettingRow
            title="界面语言"
            description="切换后菜单、页头与内置提示会同步更新，业务数据文案不受影响。"
            control={
              <Segmented<Locale>
                size="small"
                value={locale}
                options={localeOptions}
                onChange={setLocale}
              />
            }
          />
        </Card>
      </div>
    </PageContainer>
  );
}
