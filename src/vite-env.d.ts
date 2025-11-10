/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOKPLOY_URL?: string;
  readonly VITE_DOKPLOY_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
