import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useMenu } from '../../menu/MenuProvider';

export function NotFoundPage() {
  const { t } = useI18n();
  const { firstMenuPath } = useMenu();
  const navigate = useNavigate();

  return (
    <div className="sa-result-page">
      <Result
        status="404"
        title="404"
        subTitle={t('layout.notFound.description')}
        extra={
          <Button type="primary" onClick={() => navigate(firstMenuPath)}>
            {t('layout.notFound.backHome')}
          </Button>
        }
      />
    </div>
  );
}

export function MissingPage({ component }: { component: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="sa-result-page">
      <Result
        status="warning"
        title={t('layout.missingComponent.title')}
        subTitle={
          <>
            {t('layout.missingComponent.description')}
            <code>{component}</code>
          </>
        }
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            {t('layout.notFound.backHome')}
          </Button>
        }
      />
    </div>
  );
}
