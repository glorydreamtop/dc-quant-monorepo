<template>
  <div class="flex items-center absolute right-4 bottom-2 z-9">
    <Slider class="w-24 !mr-4px" v-model:value="pageSetting.scale" :min="50" :max="150" />
    <Input
      size="small"
      class="!w-16"
      v-model:value="scaleNum"
      @blur="validNumber"
      @press-enter="validNumber"
      addon-after="%"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, watchEffect } from 'vue';
  import { Slider, Input } from 'ant-design-vue';
  import { usePageSettingContext } from '../../hooks';

  const pageSetting = usePageSettingContext();
  const scaleNum = ref(0);
  function validNumber({ target }) {
    const v: number = parseInt(target.value);
    pageSetting.scale = v > 150 ? 150 : v < 50 ? 50 : v;
  }
  watchEffect(() => {
    scaleNum.value = pageSetting.scale;
  });
</script>

<style lang="less" scoped>
  ::v-deep(.ant-slider-step) {
    background: @primary-color;
  }

  ::v-deep(.ant-slider-handle) {
    border-color: @primary-color;
    border-radius: 0;
  }

  ::v-deep(.ant-input-group-addon) {
    padding: 0 4px;
  }
</style>
