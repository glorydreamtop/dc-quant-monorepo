<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { BackTop } from 'ant-design-vue';

  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useUserStoreWithOut } from '/@/store/modules/user';

  import { createAsyncComponent } from '@dq-next/utils/createAsyncComponent';

  import SessionTimeoutLogin from '/@/views/sys/login/SessionTimeoutLogin.vue';
  export default defineComponent({
    name: 'LayoutFeatures',
    components: {
      BackTop,
      LayoutLockPage: createAsyncComponent(() => import('/@/views/sys/lock/index.vue')),
      SessionTimeoutLogin,
    },
    setup() {
      const { getUseOpenBackTop } = useRootSetting();
      const userStore = useUserStoreWithOut();
      const { prefixCls } = useDesign('setting-drawer-feature');

      const getIsSessionTimeout = computed(() => userStore.getSessionTimeout);

      return {
        getTarget: () => document.body,
        getUseOpenBackTop,
        prefixCls,
        getIsSessionTimeout,
      };
    },
  });
</script>

<template>
  <LayoutLockPage />
  <BackTop v-if="getUseOpenBackTop" :target="getTarget" />
  <SessionTimeoutLogin v-if="getIsSessionTimeout" />
</template>

<style lang="less">
  @prefix-cls: ~'@{namespace}-setting-drawer-feature';

  .@{prefix-cls} {
    position: absolute;
    top: 45%;
    right: 0;
    z-index: 10;
    display: flex;
    padding: 10px;
    color: @white;
    cursor: pointer;
    background-color: @primary-color;
    border-radius: 6px 0 0 6px;
    justify-content: center;
    align-items: center;

    svg {
      width: 1em;
      height: 1em;
    }
  }
</style>
