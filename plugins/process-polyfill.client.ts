// Polyfill process pour Supabase dans les WebViews (Capacitor)
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  ;(window as any).process = {
    env: {},
    cwd: () => '/',
    version: '',
    versions: {},
    platform: 'browser',
    nextTick: (fn: () => void) => setTimeout(fn, 0),
  }
}
