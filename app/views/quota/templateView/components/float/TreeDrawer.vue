<template>
  <BarDrawer
    width="300px"
    :style="{
      top: '8rem',
      height: 'calc(100% - 9rem)',
      left: '1rem',
    }"
  >
    <TemplateTree ref="drawerTree" :show-search="false" class="h-full w-full" v-bind="attrs" />
  </BarDrawer>
</template>

<script lang="ts" setup>
  import { SetupContext, useAttrs, computed } from 'vue';
  import { BarDrawer } from '/@/components/Drawer';
  import { TemplateTree } from '/@/components/TemplateTree';
  const attr = useAttrs();
  const attrs = computed<SetupContext['attrs']>(() => {
    const attrs = {};
    const drawerEvents = ['Register', 'Close', 'Ok', 'VisibleChange', 'AfterVisibleChange'];
    for (const key in attr) {
      // 拿到绑定的事件并过滤掉drawer的事件，传给Tree
      if (
        Object.prototype.hasOwnProperty.call(attr, key) &&
        /^on/.test(key) &&
        !drawerEvents.includes(key.slice(2))
      ) {
        attrs[key] = attr[key];
      }
    }
    return attrs;
  });
</script>

<style lang="less" scoped></style>
