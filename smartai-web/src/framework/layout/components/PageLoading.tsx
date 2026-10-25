import { Spin } from 'antd';
import { useI18n } from '@/framework/i18n/I18nProvider';

export function PageLoading() {
  const { t } = useI18n();
  return (
    <div className="sa-page-loading">
      <Spin size="large" />
      <span>{t('layout.menu.loading')}</span>
    </div>
  );
}
