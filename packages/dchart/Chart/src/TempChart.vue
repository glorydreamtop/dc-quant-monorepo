<template>
  <BasicChart
    class="w-full"
    :config="chartConfig"
    @render-success="renderSuccess"
    :paint-mode="false"
  />
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';
  import BasicChart from './BasicChart.vue';
  import { chartConfigType } from '../../chart';
  import { EChartsCoreOption } from 'echarts/core';
  import { getTemplateData } from '@dq-next/http-apis/template';
  import { autoVersionTransfer } from '@dq-next/utils/helper/versionTransfer';
  import { mergeAndRemove } from '@dq-next/utils/helper/commonHelper';
  import { cloneDeep, mergeWith } from 'lodash-es';

  const props = defineProps<{
    id: number;
    config?: chartConfigType;
  }>();

  const emits = defineEmits<{
    (event: 'renderSuccess', options: EChartsCoreOption): void;
  }>();

  function renderSuccess(options: EChartsCoreOption) {
    emits('renderSuccess', options);
  }

  watch(
    () => props.id,
    async (id) => {
      const temp = await getTemplateData({ id });
      const { config } = autoVersionTransfer(temp);
      mergeWith(config, cloneDeep(props.config), (target, src) => {
        if (target instanceof Array) {
          return reactive(src);
        }
      });
      mergeAndRemove(chartConfig, config);
    },
    { immediate: true },
  );

  const chartConfig = reactive({}) as chartConfigType;
</script>

<style lang="less" scoped></style>
