<template>
  <div class="flex justify-start items-center h-layout-full p-4 gap-4 w-full overflow-hidden">
    <div class="h-full w-75 relative border">
      <QuotaTree :show-search="true" class="h-full w-full enter-y" @selectNode="selectNode" />
    </div>
    <div class="flex-grow h-full">
      <TableEditor />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { QuotaTree } from '/@/components/QuotaTree';
  import TableEditor from './components/TableEditor.vue';
</script>

<style lang="less" scoped>
  .scale {
    right: -8px;
    bottom: 50%;
  }
</style>
