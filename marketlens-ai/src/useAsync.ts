import { useCallback, useEffect, useState } from 'react';
import type { ApiResult } from './services/api';

export type Status = 'loading' | 'error' | 'ready';
export interface AsyncState<T> {
  status: Status; result?: ApiResult<T>; error?: string;
  retry: () => void; mutate: (u: (d: T) => T) => void;
}

export function useAsync<T>(fn: () => Promise<ApiResult<T>>, deps: unknown[] = []): AsyncState<T> {
  const [state, setState] = useState<{ status: Status; result?: ApiResult<T>; error?: string }>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState({ status: 'loading' });
    fn().then((result) => { if (live) setState({ status: 'ready', result }); })
        .catch((e: Error) => { if (live) setState({ status: 'error', error: e.message }); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);
  const retry = useCallback(() => setTick((t) => t + 1), []);
  const mutate = useCallback((u: (d: T) => T) =>
    setState((s) => (s.result ? { ...s, result: { ...s.result, data: u(s.result.data) } } : s)), []);
  return { ...state, retry, mutate };
}
