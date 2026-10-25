import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '@/framework/utils/storage';

/**
 * localStorage 持久化 state。
 * 读取时会与默认值浅合并，避免升级后新增字段缺失。
 */
export function usePersistentState<T extends object>(
  key: string,
  defaults: T,
): [T, (patch: Partial<T> | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => ({
    ...defaults,
    ...readStorage<Partial<T>>(key, {}),
  }));

  const update = useCallback((patch: Partial<T> | ((prev: T) => T)) => {
    setState((prev) => (typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }));
  }, []);

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  return [state, update];
}
