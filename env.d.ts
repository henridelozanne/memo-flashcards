/// <reference types="vite/client" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.nuxt/nuxt.d.ts" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
