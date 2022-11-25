/**
 * Application configuration
 */
import type { ProjectConfig } from '/#/config';

import { PROJ_CFG_KEY } from '/@/enums/cacheEnum';
import projectSetting from '/@/settings/projectSetting';

import { updateHeaderBgColor, updateSidebarBgColor, updateDarkTheme } from '/@/logics/theme';
import { isMobile } from '@dq-next/utils/is';

import { useAppStore } from '/@/store/modules/app';
import { useLocaleStore } from '/@/store/modules/locale';
import { webStorage } from '@dq-next/utils/storageCache';
import { deepMerge } from '@dq-next/utils';
import { ThemeEnum } from '/@/enums/appEnum';
import { setCssVar } from './theme/util';

// Initial project configuration
export function initAppConfigStore() {
  initDPR();
  const localeStore = useLocaleStore();
  const appStore = useAppStore();
  let projCfg: ProjectConfig = webStorage.ls.get(PROJ_CFG_KEY) as ProjectConfig;
  projCfg = deepMerge(projectSetting, projCfg || {});
  const darkMode = appStore.getDarkMode;
  const {
    // colorWeak,
    // grayMode,
    // themeColor,
    headerSetting: { bgColor: headerBgColor } = {},
    menuSetting: { bgColor } = {},
  } = projCfg;
  appStore.setProjectConfig(projCfg);

  // init dark mode
  updateDarkTheme(darkMode);
  if (darkMode === ThemeEnum.DARK) {
    updateHeaderBgColor();
    updateSidebarBgColor();
  } else {
    headerBgColor && updateHeaderBgColor(headerBgColor);
    bgColor && updateSidebarBgColor(bgColor);
  }
  // init store
  localeStore.initLocale();
}

// 适配小屏幕且缩放比大于1的设备
export const initDPR = () => {
  const screenWidth = window.screen.width;
  setCssVar('--full-vh', '100vh');
  if (screenWidth < 1920 && !isMobile()) {
    // setCssVar('--full-vh', `${(1920 / screenWidth) * 100}vh`);
    // document.documentElement.style.setProperty('zoom', `${(screenWidth / 1920) * 100}%`);
  }
};
