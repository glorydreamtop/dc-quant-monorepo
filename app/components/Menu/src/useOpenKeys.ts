import { MenuModeEnum } from '/@/enums/menuEnum';
import type { Menu as MenuType } from '/@/router/types';
import type { MenuState } from './types';

import { computed, Ref, toRaw } from 'vue';

import { unref } from 'vue';
import { uniq } from 'lodash-es';
import { getAllParentPath } from '/@/router/helper/menuHelper';
import { useTimeoutFn } from '/@/hooks/core/useTimeout';

export function useOpenKeys(
  menuState: MenuState,
  menus: Ref<MenuType[]>,
  mode: Ref<MenuModeEnum>,
  accordion: Ref<boolean>,
) {
  async function setOpenKeys(path: string) {
    if (mode.value === MenuModeEnum.HORIZONTAL) {
      return;
    }
    useTimeoutFn(
      () => {
        const menuList = toRaw(menus.value);
        if (menuList?.length === 0) {
          menuState.openKeys = [];
          return;
        }
        if (!unref(accordion)) {
          menuState.openKeys = uniq([...menuState.openKeys, ...getAllParentPath(menuList, path)]);
        } else {
          menuState.openKeys = getAllParentPath(menuList, path);
        }
      },
      16,
      false,
    );
  }

  const getOpenKeys = computed(() => menuState.openKeys);

  /**
   * @description:  重置值
   */
  function resetKeys() {
    menuState.selectedKeys = [];
    menuState.openKeys = [];
  }

  function handleOpenChange(openKeys: string[]) {
    if (unref(mode) === MenuModeEnum.HORIZONTAL || !unref(accordion)) {
      menuState.openKeys = openKeys;
    } else {
      // const menuList = toRaw(menus.value);
      // getAllParentPath(menuList, path);
      const rootSubMenuKeys: string[] = [];
      for (const { children, path } of unref(menus)) {
        if (children && children.length > 0) {
          rootSubMenuKeys.push(path);
        }
      }
      const latestOpenKey = openKeys.find((key) => menuState.openKeys.indexOf(key) === -1);
      if (rootSubMenuKeys.indexOf(latestOpenKey as string) === -1) {
        menuState.openKeys = openKeys;
      } else {
        menuState.openKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    }
  }
  return { setOpenKeys, resetKeys, getOpenKeys, handleOpenChange };
}
