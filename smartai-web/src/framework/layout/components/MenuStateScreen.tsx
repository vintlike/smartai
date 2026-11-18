import { Button } from 'antd';
import { useI18n } from '../../i18n/I18nProvider';

/** 菜单加载失败（侧边栏 / 顶栏使用）：保持布局紧凑并提供重试 */
export function MenuErrorInline({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="app-layout-menu-error" title={error?.message}>
      <span>{t('menu.error')}</span>
      <Button type="link" size="small" onClick={onRetry}>
        {t('menu.retry')}
      </Button>
    </div>
  );
}
