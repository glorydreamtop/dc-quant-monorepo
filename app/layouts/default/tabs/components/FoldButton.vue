<template>
  <span :class="`${prefixCls}__extra-fold`" @click="handleFold">
    <Icon :icon="getIcon" />
  </span>
</template>
<script lang="ts">
  import { defineComponent, unref, computed, ref } from 'vue';
  import { Icon } from '@dq-next/icon';

  import { useDesign } from '/@/hooks/web/useDesign';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { triggerWindowResize } from '@dq-next/utils/event';

  export default defineComponent({
    name: 'FoldButton',
    components: { Icon },
    setup() {
      const { prefixCls } = useDesign('multiple-tabs-content');
      const { setMenuSetting } = useMenuSetting();

      const getIsUnFold = ref(false);

      const getIcon = computed(() =>
        unref(getIsUnFold) ? 'codicon:screen-normal' : 'codicon:screen-full',
      );

      function handleFold() {
        const isUnFold = unref(getIsUnFold);
        setMenuSetting({
          show: isUnFold,
          hidden: !isUnFold,
        });
        triggerWindowResize();
      }

      return { prefixCls, getIcon, handleFold };
    },
  });
</script>
