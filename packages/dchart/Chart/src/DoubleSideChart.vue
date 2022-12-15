<template>
  <div ref="doubleSideChart">
    <Teleport to="body" :disabled="!state.isFullScreen">
      <div :class="[state.isFullScreen ? 'fullscreen' : '', 'w-full h-full']">
        <DSChartToolBar
          :class="[
            inReport ? 'autohidden-toolbar gap-1' : 'gap-2',
            state.isFullScreen ? 'mt-4' : '',
          ]"
          :setting="props.setting"
          :state="state"
          @update:state="(v) => Object.assign(state, v)"
          @screen-shot="screenShot"
          @downloadxlsx="downloadxlsx"
        />
        <div
          class="w-full h-full preserve-3d box"
          :class="[state.isFullScreen ? 'pt-4' : '']"
          id="quota-view-chartbox"
        >
          <BasicChart
            :class="['chart-view w-full', state.showTable ? 'back' : 'front']"
            :config="config"
            :paintMode="state.paintMode"
            @update-config="updateConfig"
            @render-success="renderSuccess"
            ref="chartRef"
          />
          <QuotaDataTable
            v-if="state.loadTable"
            :class="['table-view', state.showTable ? 'front' : 'back']"
            :config="config"
            ref="tableRef"
          />
          <!-- 绘制墨迹的区域 -->
          <PaintArea :paint-mode="state.paintMode" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
  import { ref, toRefs, onMounted, reactive } from 'vue';
  import BasicChart from './BasicChart.vue';
  import DSChartToolBar from './DSChartToolBar.vue';
  import { PaintArea } from 'svg-mark';
  import { QuotaDataTable } from '/@/components/QuotaTable';
  import { chartConfigType, chartSetting } from '../../chart';
  import { EChartsCoreOption, EChartsType } from 'echarts/core';
  import { downloadByBase64 } from '@dq-next/utils/file';

  const props = defineProps<{
    config: chartConfigType;
    setting?: Partial<chartSetting>;
  }>();
  const emit = defineEmits<{
    (event: 'updateConfig', config: chartConfigType): void;
    (event: 'renderSuccess', options: EChartsCoreOption): void;
  }>();
  const { config } = toRefs(props);

  const state = reactive({
    paintMode: false,
    showTable: false,
    loadTable: false,
    isFullScreen: false,
    renderSuccess: false,
  });

  const doubleSideChart = ref<HTMLDivElement>();

  // 是否在报告中，显示工具栏,否则仅在鼠标移动到图表上显示
  const inReport = ref(false);
  onMounted(() => {
    inReport.value = doubleSideChart.value!.parentElement!.hasAttribute('data-uniqid');
  });

  function updateConfig(cfg: chartConfigType) {
    emit('updateConfig', cfg);
  }
  function renderSuccess(options: EChartsCoreOption) {
    emit('renderSuccess', options);
  }
  const chartRef = ref<
    {
      getInstance: () => EChartsType;
    } & ComponentRef
  >();
  const tableRef = ref<
    {
      download: () => void;
    } & ComponentRef
  >();
  function downloadxlsx() {
    tableRef.value!.download();
  }
  function screenShot() {
    // svg渲染器只能导出svg格式
    const url = (chartRef.value!.getInstance() as EChartsType).getDataURL({
      type: 'svg',
      pixelRatio: 2,
      backgroundColor: '#FFF',
    });
    const arr = url.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    // 创建一个canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = chartRef.value!.getInstance().getWidth() * 2;
    canvas.height = chartRef.value!.getInstance().getHeight() * 2;
    const img = new Image();
    img.onload = function () {
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      downloadByBase64(dataUrl, `${config.value.title}.png`);
    };
    img.src = `data:${mime};base64,${window.btoa(unescape(arr[1]))}`;
  }
</script>

<style lang="less" scoped>
  .fullscreen {
    position: absolute;
    z-index: 999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: @white;

    .chart-view {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
  }

  .box {
    transition: width 0.3s ease;
  }

  .table-view {
    padding-top: 30px;
  }

  .chart-view {
    background: @white;
  }

  .chart-view,
  .table-view {
    position: absolute;
    backface-visibility: hidden;
    transform-style: preserve-3d;
    transition: all 1s;

    &.front {
      transform: rotateY(0);
      z-index: 9;
    }

    &.back {
      transform: rotateY(180deg);
      z-index: 8;
    }
  }

  // .paint-mode {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 100%;
  //   height: 100%;
  //   z-index: 999;

  //   .chart-view {
  //     @apply bg-white;
  //   }
  // }

  .paint-mode-icon {
    transition: filter 0.2s ease;
  }
</style>
