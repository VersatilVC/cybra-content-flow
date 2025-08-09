
// Lightweight dev-only logger. Info/debug/warn only in development; errors always logged.
const isDev = (() => {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname || '';
  return hostname.includes('localhost');
})();

export const logger = {
  debug: (...args: any[]) => { if (isDev) console.debug(...args); },
  info: (...args: any[]) => { if (isDev) console.info(...args); },
  warn: (...args: any[]) => { if (isDev) console.warn(...args); },
  error: (...args: any[]) => { console.error(...args); },
};
