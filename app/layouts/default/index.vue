<template>
  <Layout has-sider v-bind="lockEvents">
    <LayoutFeatures />
    <LayoutSideBar />
    <Layout>
      <LayoutMultipleHeader />
      <LayoutContent />
      <LayoutFooter />
    </Layout>
  </Layout>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Layout } from 'ant-design-vue';
  import { createAsyncComponent } from '@dq-next/utils/factory/createAsyncComponent';

  import LayoutContent from './content/index.vue';
  import LayoutSideBar from './sider/index.vue';
  import LayoutMultipleHeader from './header/MultipleHeader.vue';
  import { useLockPage } from '/@/hooks/web/useLockPage';

  export default defineComponent({
    name: 'DefaultLayout',
    components: {
      LayoutFeatures: createAsyncComponent(() => import('/@/layouts/default/feature/index.vue')),
      LayoutFooter: createAsyncComponent(() => import('/@/layouts/default/footer/index.vue')),
      LayoutContent,
      LayoutSideBar,
      LayoutMultipleHeader,
      Layout,
    },
    setup() {
      // Create a lock screen monitor
      const lockEvents = useLockPage();

      return {
        lockEvents,
      };
    },
  });
</script>
<style lang="less"></style>
