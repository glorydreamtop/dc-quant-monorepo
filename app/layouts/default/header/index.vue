<template>
  <Header :class="prefixCls">
    <!-- left start -->
    <LayoutBreadcrumb />
    <!-- left end -->

    <!-- action  -->
    <div :class="`${prefixCls}-action`">
      <Tooltip :title="`已连接${version === 'PROD' ? '正式' : '测试'}数据库`">
        <div class="font-bold text-red-500 mr-2 select-none">{{ version }}</div>
      </Tooltip>

      <AppSearch :class="`${prefixCls}-action__item `" />

      <ErrorAction v-if="getUseErrorHandle" :class="`${prefixCls}-action__item error-action`" />

      <Notify :class="`${prefixCls}-action__item notify-item`" />

      <FullScreen :class="`${prefixCls}-action__item fullscreen-item`" />

      <AppLocalePicker
        v-if="getShowLocalePicker"
        :reload="true"
        :showText="false"
        :class="`${prefixCls}-action__item`"
      />
      <UserDropDown />
      <SettingDrawer :class="`${prefixCls}-action__item`" />
    </div>
  </Header>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Tooltip } from 'ant-design-vue';

  import { propTypes } from '@dq-next/utils/propTypes';

  import { Layout } from 'ant-design-vue';

  import { AppSearch } from '/@/components/Application';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

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
    setup() {
      const { prefixCls } = useDesign('layout-header');
      const { getUseErrorHandle, getShowSettingButton } = useRootSetting();

      const { getShowLocalePicker } = useLocale();

      //@ts-ignore
      const version = /dev/i.test(import.meta.env.VITE_PROXY) ? 'TEST' : 'PROD';

      return {
        prefixCls,
        getShowLocalePicker,
        getUseErrorHandle,
        getShowSettingButton,
        version,
      };
    },
  });
</script>
<style lang="less">
  @import './index.less';
</style>
