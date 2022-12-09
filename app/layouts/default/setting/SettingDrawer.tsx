import { defineComponent, unref } from 'vue';
import { BasicDrawer } from '/@/components/Drawer/index';
import { Divider } from 'ant-design-vue';
import { ThemeColorPicker, SettingFooter, InputNumberItem } from './components';

import { AppDarkModeToggle } from '/@/components/Application';

import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { useI18n } from '/@/hooks/web/useI18n';

import { HandlerEnum } from './enum';

import {
  HEADER_PRESET_BG_COLOR_LIST,
  SIDE_BAR_BG_COLOR_LIST,
  APP_PRESET_COLOR_LIST,
} from '/@/settings/designSetting';

const { t } = useI18n();

export default defineComponent({
  name: 'SettingDrawer',
  setup(_, { attrs }) {
    const { getLockTime, getShowDarkModeToggle, getThemeColor } = useRootSetting();

    function renderHeaderTheme() {
      return (
        <ThemeColorPicker
          colorList={HEADER_PRESET_BG_COLOR_LIST}
          event={HandlerEnum.HEADER_THEME}
        />
      );
    }

    function renderSiderTheme() {
      return (
        <ThemeColorPicker
          colorList={SIDE_BAR_BG_COLOR_LIST}
          def="#ffffff"
          event={HandlerEnum.MENU_THEME}
        />
      );
    }

    function renderMainTheme() {
      return (
        <ThemeColorPicker
          colorList={APP_PRESET_COLOR_LIST}
          def={unref(getThemeColor)}
          event={HandlerEnum.CHANGE_THEME_COLOR}
        />
      );
    }

    /**
     * @description:
     */
    function renderFeatures() {
      return (
        <InputNumberItem
          title={t('layout.setting.autoScreenLock')}
          min={0}
          event={HandlerEnum.LOCK_TIME}
          defaultValue={unref(getLockTime)}
          formatter={(value: string) => {
            return parseInt(value) === 0
              ? `0(${t('layout.setting.notAutoScreenLock')})`
              : `${value}${t('layout.setting.minute')}`;
          }}
        />
      );
    }

    return () => (
      <BasicDrawer
        {...attrs}
        title={t('layout.setting.drawerTitle')}
        width={330}
        class="setting-drawer"
      >
        {unref(getShowDarkModeToggle) && <Divider>{() => t('layout.setting.darkMode')}</Divider>}
        {unref(getShowDarkModeToggle) && <AppDarkModeToggle class="mx-auto" />}
        <Divider>{() => t('layout.setting.sysTheme')}</Divider>
        {renderMainTheme()}
        <Divider>{() => t('layout.setting.headerTheme')}</Divider>
        {renderHeaderTheme()}
        <Divider>{() => t('layout.setting.sidebarTheme')}</Divider>
        {renderSiderTheme()}
        <Divider>{() => t('layout.setting.interfaceFunction')}</Divider>
        {renderFeatures()}
        <Divider />
        <SettingFooter />
      </BasicDrawer>
    );
  },
});
