<template>
  <div class="flex justify-start items-center h-layout-full p-4 gap-4 w-full overflow-hidden">
    <div class="w-75 h-full border">
      <TemplateTree :show-search="true" class="h-full w-full enter-y" @selectNode="selectNode" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  // import { ref } from 'vue';
  import { TemplateTree } from '/@/components/TemplateTree';

  function selectNode() {}
</script>

<style lang="less" scoped></style>
