import type { GlobEnvConfig } from '/#/config';

import { warn } from './log';

export function getAppEnvConfig<T extends Recordable = GlobEnvConfig>() {
  const ENV = import.meta.env as unknown as T;

  const { VITE_GLOB_APP_SHORT_NAME } = ENV;

  if (!/^[a-zA-Z\_]*$/.test(VITE_GLOB_APP_SHORT_NAME)) {
    warn(
      `VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`,
    );
  }

  return ENV;
}

/**
 * @description: Development mode
 */
export const devMode = 'development';

/**
 * @description: Production mode
 */
export const prodMode = 'production';

/**
 * @description: Get environment variables
 */
export function getEnv(): string {
  return import.meta.env.MODE;
}

/**
 * @description: Is it a development mode
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV;
}

/**
 * @description: Is it a production mode
 */
export function isProdMode(): boolean {
  return import.meta.env.PROD;
}
