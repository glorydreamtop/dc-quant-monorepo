<template>
  <div :class="[prefixCls, `${prefixCls}--light`]">
    <LayoutHeader />
    <MultipleTabs />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';

  import LayoutHeader from './index.vue';
  import MultipleTabs from '../tabs/index.vue';
  import { useDesign } from '/@/hooks/web/useDesign';

  export default defineComponent({
    name: 'LayoutMultipleHeader',
    components: { LayoutHeader, MultipleTabs },
    setup() {
      const { prefixCls } = useDesign('layout-multiple-header');

      return {
        prefixCls,
      };
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-layout-multiple-header';

  .@{prefix-cls} {
    transition: width 0.2s;
    flex: 0 0 auto;

    &--dark {
      margin-left: -1px;
    }
  }
</style>
