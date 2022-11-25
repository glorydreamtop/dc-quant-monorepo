import type { GlobConfig } from '/#/config';

import { warn } from '@dq-next/utils/log';
import { getAppEnvConfig } from '@dq-next/utils/env';

export const useGlobSetting = (): Readonly<GlobConfig> => {
  const ENV = getAppEnvConfig();

  if (!/[a-zA-Z\_]*/.test(ENV.VITE_GLOB_APP_SHORT_NAME)) {
    warn(
      `VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`,
    );
  }

  // Take global configuration
  const glob: Readonly<GlobConfig> = {
    title: ENV.VITE_GLOB_APP_TITLE,
    apiUrl: ENV.VITE_GLOB_API_URL,
    jodiUrl: ENV.VITE_GLOB_JODI_URL,
    vesselUrl: ENV.VITE_GLOB_VESSEL_URL,
    monitorUrl: ENV.VITE_GLOB_MONITOR_URL,
    nodeUrl: ENV.VITE_GLOB_NODE_URL,
    shortName: ENV.VITE_GLOB_APP_SHORT_NAME,
    urlPrefix: ENV.VITE_GLOB_API_URL_PREFIX,
    uploadUrl: ENV.VITE_GLOB_UPLOAD_URL,
  };
  return glob as Readonly<GlobConfig>;
};
