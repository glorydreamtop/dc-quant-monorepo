<template>
  <div class="flex flex-grow p-4 bg-white border relative min-w-fit" id="chart-generator">
    <div class="relative flex-grow">
      <ToolBar @paint="paint" />
      <DoubleSideChart
        class="w-full h-full"
        :config="config"
        @update-config="updateConfig"
        @render-success="renderSuccess"
      />
      <!-- <TempChart
        class="w-full h-full"
        :config="config"
        :id="64221207"
        @update-config="updateConfig"
        @render-success="renderSuccess"
      /> -->
    </div>
    <BarDrawer
      width="380px"
      :style="{
        top: '0',
        height: '100%',
        right: '0',
      }"
      getContainer="#chart-generator"
      inside
    >
      <Advance>
        <template #actions>
          <Button block @click="saveTemplate" :disabled="!allowSave">
            <span>{{ t('quotaView.advance.saveBtn') }}</span>
          </Button>
        </template>
      </Advance>
    </BarDrawer>
    <TempSave @register="registerTempSave" />
  </div>
</template>
<script lang="ts" setup>
  import ToolBar from './ToolBar.vue';
  import Advance from './Advance.vue';
  import { DoubleSideChart, TempChart, setToken } from '@dq-next/dchart';

  import { echartMitter, useChartConfigContext } from './hooks';
  import { reactive, ref, toRaw, watch, nextTick } from 'vue';
  import { Button } from 'ant-design-vue';
  import type { chartConfigType } from '/#/chart';
  import { cloneDeep, mergeWith } from 'lodash-es';
  import { EChartsCoreOption } from 'echarts/core';
  import { mergeAndRemove } from '@dq-next/utils/helper/commonHelper';
  import { getToken } from '@dq-next/utils/auth';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BarDrawer, useDrawer } from '/@/components/Drawer';
  import { TempSave } from '/@/components/TempSave';

  const { t } = useI18n();
  const chartConfig = useChartConfigContext();
  // 配置变化后要绘制一次才能允许保存
  const allowSave = ref(true);
  setToken(getToken());
  watch(
    chartConfig,
    (v) => {
      if (v) {
        allowSave.value = false;
      }
    },
    { deep: true },
  );
  const config = reactive({}) as chartConfigType;
  function paint() {
    mergeAndRemove(config, chartConfig);
    nextTick(() => {
      allowSave.value = true;
    });
  }
  function updateConfig(cfg: chartConfigType) {
    mergeWith(chartConfig, cloneDeep(cfg), (target, src) => {
      if (target instanceof Array) {
        return reactive(src);
      }
    });
    paint();
  }
  // 绘图完成
  function renderSuccess(options: EChartsCoreOption) {
    echartMitter.emit('echartOptions', options);
  }
  function saveTemplate() {
    openTempSave(true, {
      chartConfig: toRaw(chartConfig),
    });
  }

  const [registerTempSave, { openDrawer: openTempSave }] = useDrawer();
</script>

<style lang="less" scoped>
  ::v-deep(.ant-drawer-body) {
    padding-right: 1rem;
  }
</style>
