import { Button, Tooltip } from 'antd';
import { useI18n } from '../../i18n/I18nProvider';

/** 中英文切换（文字标识随语言切换：中 / En，点击直接切换） */
export function AppLocaleSwitch() {
  const { locale, toggleLocale, t } = useI18n();
  const isChinese = locale === 'zh-CN';

  /** 提示即将切换到的语言 */
  const tip = t(isChinese ? 'locale.toEnglish' : 'locale.toChinese');

  return (
    <Tooltip title={tip}>
      <Button
        type="text"
        size="small"
        className="app-locale-switch"
        aria-label={tip}
        onClick={toggleLocale}
      >
        {isChinese ? '中' : 'En'}
      </Button>
    </Tooltip>
  );
}
