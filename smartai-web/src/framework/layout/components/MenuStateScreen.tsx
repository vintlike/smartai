import { Button, Result, Spin } from 'antd';
import { useI18n } from '@/framework/i18n/I18nProvider';

export function MenuLoadingScreen() {
  const { t } = useI18n();
  return (
    <div className="sa-state-screen">
      <Spin size="large" />
      <p>{t('layout.menu.loading')}</p>
    </div>
  );
}

export function MenuErrorScreen({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="sa-state-screen">
      <Result
        status="warning"
        title={t('layout.menu.error')}
        subTitle={error?.message}
        extra={
          <Button type="primary" onClick={onRetry}>
            {t('layout.menu.retry')}
          </Button>
        }
      />
    </div>
  );
}
