<template>
  <Header :class="getHeaderClass">
    <!-- left start -->
    <div :class="`${prefixCls}-left`">
      <!-- logo -->
      <AppLogo
        v-if="getShowHeaderLogo"
        :class="`${prefixCls}-logo`"
        :theme="getHeaderTheme"
        :style="getLogoWidth"
      />
      <LayoutTrigger
        v-if="getShowContent && getShowHeaderTrigger && !getSplit && !getIsMixSidebar"
        :theme="getHeaderTheme"
        :sider="false"
      />
      <LayoutBreadcrumb v-if="getShowContent && getShowBread" :theme="getHeaderTheme" />
    </div>
    <!-- left end -->

    <!-- action  -->
    <div :class="`${prefixCls}-action`">
      <Tooltip :title="`已连接${version === 'PROD' ? '正式' : '测试'}数据库`">
        <div class="font-bold text-red-500 mr-2 select-none">{{ version }}</div>
      </Tooltip>

      <AppSearch :class="`${prefixCls}-action__item `" v-if="getShowSearch" />

      <ErrorAction v-if="getUseErrorHandle" :class="`${prefixCls}-action__item error-action`" />

      <Notify v-if="getShowNotice" :class="`${prefixCls}-action__item notify-item`" />

      <FullScreen v-if="getShowFullScreen" :class="`${prefixCls}-action__item fullscreen-item`" />

      <AppLocalePicker
        v-if="getShowLocalePicker"
        :reload="true"
        :showText="false"
        :class="`${prefixCls}-action__item`"
      />

      <UserDropDown :theme="getHeaderTheme" />

      <SettingDrawer v-if="getShowSetting" :class="`${prefixCls}-action__item`" />
    </div>
  </Header>
</template>
<script lang="ts">
  import { defineComponent, unref, computed } from 'vue';
  import { Tooltip } from 'ant-design-vue';

  import { propTypes } from '@dq-next/utils/propTypes';

  import { Layout } from 'ant-design-vue';
  import { AppLogo } from '/@/components/Application';
  import LayoutTrigger from '../trigger/index.vue';

  import { AppSearch } from '/@/components/Application';

  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  import { MenuModeEnum, MenuSplitTyeEnum } from '/@/enums/menuEnum';
  import { SettingButtonPositionEnum } from '/@/enums/appEnum';
  import { AppLocalePicker } from '/@/components/Application';

  import { UserDropDown, LayoutBreadcrumb, FullScreen, Notify, ErrorAction } from './components';
  import { useDesign } from '/@/hooks/web/useDesign';

  import { createAsyncComponent } from '@dq-next/utils/factory/createAsyncComponent';
  import { useLocale } from '/@/locales/useLocale';

  export default defineComponent({
    name: 'LayoutHeader',
    components: {
      Tooltip,
      Header: Layout.Header,
      AppLogo,
      LayoutTrigger,
      LayoutBreadcrumb,
      UserDropDown,
      AppLocalePicker,
      FullScreen,
      Notify,
      AppSearch,
      ErrorAction,
      SettingDrawer: createAsyncComponent(() => import('/@/layouts/default/setting/index.vue'), {
        loading: true,
      }),
    },
    props: {
      fixed: propTypes.bool,
    },
    setup(props) {
      const { prefixCls } = useDesign('layout-header');
      const {
        getShowTopMenu,
        getShowHeaderTrigger,
        getSplit,
        getIsMixMode,
        getMenuWidth,
        getIsMixSidebar,
      } = useMenuSetting();
      const { getUseErrorHandle, getShowSettingButton, getSettingButtonPosition } =
        useRootSetting();

      const {
        getHeaderTheme,
        getShowFullScreen,
        getShowNotice,
        getShowContent,
        getShowBread,
        getShowHeaderLogo,
        getShowHeader,
        getShowSearch,
      } = useHeaderSetting();

      const { getShowLocalePicker } = useLocale();

      const getHeaderClass = computed(() => {
        const theme = unref(getHeaderTheme);
        return [
          prefixCls,
          {
            [`${prefixCls}--fixed`]: props.fixed,
            [`${prefixCls}--${theme}`]: theme,
          },
        ];
      });

      const getShowSetting = computed(() => {
        if (!unref(getShowSettingButton)) {
          return false;
        }
        const settingButtonPosition = unref(getSettingButtonPosition);

        if (settingButtonPosition === SettingButtonPositionEnum.AUTO) {
          return unref(getShowHeader);
        }
        return settingButtonPosition === SettingButtonPositionEnum.HEADER;
      });

      const getLogoWidth = computed(() => {
        if (!unref(getIsMixMode)) {
          return {};
        }
        const width = unref(getMenuWidth) < 180 ? 180 : unref(getMenuWidth);
        return { width: `${width}px` };
      });

      const getSplitType = computed(() => {
        return unref(getSplit) ? MenuSplitTyeEnum.TOP : MenuSplitTyeEnum.NONE;
      });

      const getMenuMode = computed(() => {
        return unref(getSplit) ? MenuModeEnum.HORIZONTAL : null;
      });
      //@ts-ignore
      const version = /dev/i.test(import.meta.env.VITE_PROXY) ? 'TEST' : 'PROD';

      return {
        prefixCls,
        getHeaderClass,
        getShowHeaderLogo,
        getHeaderTheme,
        getShowHeaderTrigger,
        getShowBread,
        getShowContent,
        getSplitType,
        getSplit,
        getMenuMode,
        getShowTopMenu,
        getShowLocalePicker,
        getShowFullScreen,
        getShowNotice,
        getUseErrorHandle,
        getLogoWidth,
        getIsMixSidebar,
        getShowSettingButton,
        getShowSetting,
        getShowSearch,
        version,
      };
    },
  });
</script>
<style lang="less">
  @import './index.less';
</style>
