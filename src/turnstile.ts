declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  size: 'invisible' | 'normal' | 'compact';
  callback: (token: string) => void;
  'error-callback'?: (error?: unknown) => void;
  'expired-callback'?: () => void;
  'retry'?: 'auto' | 'never';
  'retry-interval'?: number;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
}

const SITE_KEY = (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY) as string | undefined;

let widgetId: string | null = null;
let widgetContainer: HTMLElement | null = null;
let tokenResolve: ((token: string | null) => void) | null = null;
// Set when getTurnstileToken() times out without producing a token,
// signalling the widget is likely broken and needs a full re-render.
let needsRerender = false;

function renderWidget() {
  if (!SITE_KEY || !window.turnstile || !widgetContainer) return;

  if (widgetId !== null) {
    window.turnstile.remove(widgetId);
    widgetId = null;
  }

  needsRerender = false;

  widgetId = window.turnstile.render(widgetContainer, {
    sitekey: SITE_KEY,
    size: 'invisible',
    'refresh-expired': 'auto',
    'retry': 'auto',
    'retry-interval': 8000,
    callback: (token: string) => {
      needsRerender = false;
      if (tokenResolve) {
        const resolve = tokenResolve;
        tokenResolve = null;
        resolve(token);
      }
    },
    'error-callback': () => {
      // Turnstile auto-retries (retry: 'auto'). Do NOT remove/re-render
      // the widget here — that conflicts with the internal retry timer and
      // causes challenge-platform 401s + error 300010.
      // The 15 s timeout in getTurnstileToken() is the safety net; if the
      // widget never recovers, needsRerender is set and the next call will
      // do a full re-render.
    },
    'expired-callback': () => {
      // Token expired — Turnstile auto-refreshes (refresh-expired: 'auto').
      // Do NOT remove/re-render the widget — that destroys the widget
      // mid-refresh and causes challenge-platform 401s + error 300010.
    },
  });
}

export function renderTurnstile(container: HTMLElement) {
  widgetContainer = container;
  renderWidget();
}

export async function getTurnstileToken(): Promise<string | null> {
  if (!SITE_KEY || !window.turnstile) return null;

  // If the widget was never created, or a previous token request timed out
  // (meaning the widget is probably broken), do a full re-render.
  if (widgetId === null || needsRerender) {
    renderWidget();
    await new Promise((r) => setTimeout(r, 500));
  }

  if (widgetId === null) return null;

  // Cancel any pending caller before resetting — prevents race where
  // two concurrent getTurnstileToken() calls share tokenResolve
  if (tokenResolve) {
    const stale = tokenResolve;
    tokenResolve = null;
    stale(null);
  }

  window.turnstile.reset(widgetId);

  return new Promise<string | null>((resolve) => {
    tokenResolve = resolve;
    setTimeout(() => {
      if (tokenResolve === resolve) {
        tokenResolve = null;
        needsRerender = true;
        resolve(null);
      }
    }, 15000);
  });
}

export function isTurnstileAvailable(): boolean {
  return !!SITE_KEY && !!window.turnstile;
}
