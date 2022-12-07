import { defineComponent, unref } from 'vue';
import { BasicDrawer } from '/@/components/Drawer/index';
import { Divider } from 'ant-design-vue';
import { ThemeColorPicker, SettingFooter, SwitchItem, InputNumberItem } from './components';

import { AppDarkModeToggle } from '/@/components/Application';

import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
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
    const {
      getShowFooter,
      getShowBreadCrumb,
      getShowBreadCrumbIcon,
      getShowLogo,
      getFullContent,
      getColorWeak,
      getGrayMode,
      getLockTime,
      getShowDarkModeToggle,
      getThemeColor,
    } = useRootSetting();
    const { getIsHorizontal, getShowMenu, getMenuBgColor, getIsMixSidebar } = useMenuSetting();

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
          def={unref(getMenuBgColor)}
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

    function renderContent() {
      return (
        <>
          <SwitchItem
            title={t('layout.setting.breadcrumb')}
            event={HandlerEnum.SHOW_BREADCRUMB}
            def={unref(getShowBreadCrumb)}
          />

          <SwitchItem
            title={t('layout.setting.breadcrumbIcon')}
            event={HandlerEnum.SHOW_BREADCRUMB_ICON}
            def={unref(getShowBreadCrumbIcon)}
          />

          <SwitchItem
            title={t('layout.setting.sidebar')}
            event={HandlerEnum.MENU_SHOW_SIDEBAR}
            def={unref(getShowMenu)}
            disabled={unref(getIsHorizontal)}
          />

          <SwitchItem title={t('layout.setting.header')} event={HandlerEnum.HEADER_SHOW} />
          <SwitchItem
            title="Logo"
            event={HandlerEnum.SHOW_LOGO}
            def={unref(getShowLogo)}
            disabled={unref(getIsMixSidebar)}
          />
          <SwitchItem
            title={t('layout.setting.footer')}
            event={HandlerEnum.SHOW_FOOTER}
            def={unref(getShowFooter)}
          />
          <SwitchItem
            title={t('layout.setting.fullContent')}
            event={HandlerEnum.FULL_CONTENT}
            def={unref(getFullContent)}
          />

          <SwitchItem
            title={t('layout.setting.grayMode')}
            event={HandlerEnum.GRAY_MODE}
            def={unref(getGrayMode)}
          />

          <SwitchItem
            title={t('layout.setting.colorWeak')}
            event={HandlerEnum.COLOR_WEAK}
            def={unref(getColorWeak)}
          />
        </>
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
        <Divider>{() => t('layout.setting.interfaceDisplay')}</Divider>
        {renderContent()}
        <Divider />
        <SettingFooter />
      </BasicDrawer>
    );
  },
});
