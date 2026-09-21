import { useEffect, useRef } from 'react';

export const useAutoRefresh = (
  refresh: () => void | Promise<void>,
  intervalMs = 20_000,
) => {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    let disposed = false;
    let refreshInFlight = false;

    const runRefresh = () => {
      if (disposed || refreshInFlight) return;
      refreshInFlight = true;
      Promise.resolve(refreshRef.current()).finally(() => {
        refreshInFlight = false;
      });
    };

    const interval = window.setInterval(runRefresh, intervalMs);
    document.addEventListener('visibilitychange', runRefresh);
    window.addEventListener('focus', runRefresh);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', runRefresh);
      window.removeEventListener('focus', runRefresh);
    };
  }, [intervalMs]);
};
