/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Config injectat la runtime în producție (ex. script generat de sysadmin din variabile Docker). */
interface Window {
  __APP_CONFIG__?: {
    backend_domain?: string;
    front_domain?: string;
    /** @deprecated Folosiți `backend_domain`. */
    domain?: string;
  };
}
