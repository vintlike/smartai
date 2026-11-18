import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useLayout } from '../AppLayoutProvider';

/** 菜单声明的 component 未在 pageComponents 中注册时的兜底页 */
export function MissingPage({ component }: { component: string }) {
  const { t } = useI18n();

  return (
    <Result
      status="warning"
      title={t('result.missingComponent.title')}
      subTitle={
        <>
          {t('result.missingComponent.description')}
          <code>{component}</code>
        </>
      }
    />
  );
}

/** 404 兜底页，返回按钮跳转配置的首页 */
export function NotFoundPage() {
  const { t } = useI18n();
  const { config } = useLayout();
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title={t('result.notFound.title')}
      subTitle={t('result.notFound.description')}
      extra={
        <Button type="primary" onClick={() => navigate(config.homePath ?? '/')}>
          {t('common.backHome')}
        </Button>
      }
    />
  );
}
