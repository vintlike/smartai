import { useEffect, useRef } from 'react';
import { useLayout } from './AppLayoutProvider';

/**
 * 订阅页签栏的「刷新」：只重新加载当前页数据，页面组件不重挂载，
 * 筛选条件、列设置、弹窗等界面状态都会保留。
 * 未订阅的页面（聊天、门户等）仍回退为整页重挂载。
 */
export function usePageRefresh(handler: () => void | Promise<void>) {
  const { subscribeRefresh } = useLayout();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(
    () =>
      subscribeRefresh(() => {
        void handlerRef.current();
      }),
    [subscribeRefresh],
  );
}
