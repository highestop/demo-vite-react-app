export const environment = {
  baseUrl: import.meta.env.BASE_URL,
  mode: import.meta.env.MODE,
  production: import.meta.env.PROD,
  dev: import.meta.env.DEV,
  appFlag: import.meta.env.VIUTE_APP_FLAG
} as const
