<template>
  <div class="h-full overflow-hidden relative" v-loading="state.loading">
    <div ref="chartElRef" class="w-full h-full" @contextmenu="originContextmenu"></div>
    <div v-if="state.noChart" class="no-chart flex flex-col items-center select-none">
      <img src="../../../../app/assets/svg/no-chart.svg" />
      <span
        v-if="config.title"
        class="whitespace-nowrap mt-2 text-gray-400 flex flex-col items-center"
        ><span>{{ config.title }}</span
        ><span v-if="state.renderError">{{ t('common.renderError') }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { nextTick, ref, toRefs, unref, watch, reactive } from 'vue';
  import type { Ref } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { chartTypeEnum } from '/@/enums/chartEnum';
  import {
    useSeasonalChart,
    useNormalChart,
    useBarChart,
    useRadarChart,
    useStructuralChart,
    usePieChart,
    useQuantileRadarChart,
  } from '../tranfer';
  import type { chartConfigType, normalChartConfigType } from '/#/chart';
  import {
    onMountedOrActivated,
    onUnmountedOrDeactivated,
  } from '/@/hooks/core/onMountedOrActivated';
  import { useDebounceFn, useResizeObserver } from '@vueuse/core';
  import {
    createMountNode,
    useChartTitlePopover,
    useLineChartContextMenu,
    useXAxisIndexEdit,
    useYAxisIndexEdit,
  } from '../helper';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { EChartsCoreOption } from 'echarts/core';
  import vLoading from '/@/directives/loading';

  const props = defineProps<{
    config: chartConfigType;
    paintMode: boolean;
  }>();
  const emit = defineEmits<{
    (event: 'updateConfig', config: chartConfigType): void;
    (event: 'renderSuccess', options: EChartsCoreOption): void;
  }>();

  const { config } = toRefs(props);
  const chartElRef = ref<HTMLDivElement>();
  const { setOptions, resize, getInstance } = useECharts(chartElRef as Ref<HTMLDivElement>);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const state = reactive({
    // 还没画图
    noChart: true,
    // 渲染出错
    renderError: false,
    loading: false,
  });
  const chartTypeHooks = {
    [chartTypeEnum.seasonal]: useSeasonalChart,
    [chartTypeEnum.normal]: useNormalChart,
    [chartTypeEnum.bar]: useBarChart,
    [chartTypeEnum.normalRadar]: useRadarChart,
    [chartTypeEnum.structural]: useStructuralChart,
    [chartTypeEnum.pie]: usePieChart,
    [chartTypeEnum.quantileRadar]: useQuantileRadarChart,
  };
  defineExpose({
    getInstance,
  });
  watch(
    config,
    async (v) => {
      const hasQuotaList = Reflect.has(v, 'quotaList') && v.quotaList?.length > 0;
      const http = Reflect.has(v, 'http') && !!v.http;
      if ((!hasQuotaList && http) || !Reflect.has(v, 'http')) return;
      try {
        state.loading = true;
        getInstance()?.on('finished', function () {
          nextTick(() => {
            emit('renderSuccess', getInstance()!.getOption());
            getInstance()?.off('finished');
          });
        });
        const options = await chartTypeHooks[v.type](v);
        setOptions(options);
        state.noChart = false;
        state.renderError = false;
      } catch (error) {
        console.log(error);
        state.noChart = true;
        state.renderError = true;
        createMessage.warn(t('common.renderError'));
      } finally {
        state.loading = false;
      }
    },
    { deep: true, immediate: true },
  );
  // 屏蔽原生右键事件
  function originContextmenu(e) {
    e.preventDefault();
  }

  function update() {
    emit('updateConfig', cloneDeep(unref(config)));
  }
  interface eventBusType {
    event: any;
    target: 'title' | 'yAxis' | 'series' | 'xAxis';
    eventType: 'dblclick' | 'contextmenu' | 'mousedown' | 'mouseup' | 'mousemove';
  }
  // 监听事件的列表
  const eventBus: eventBusType[] = [];
  onMountedOrActivated(() => {
    const instance = getInstance()!;
    // 自适应大小
    const handler = useDebounceFn(resize, 100);
    const { stop: stopResizeObserve } = useResizeObserver(unref(chartElRef), handler);

    // 编辑标题
    const titleClickEvent = useChartTitlePopover({
      chartConfig: config.value,
      onOk: (title) => {
        config.value.title = title;
        update();
      },
    });
    eventBus.push({
      event: titleClickEvent,
      eventType: 'contextmenu',
      target: 'title',
    });
    // 编辑Y轴
    const yAxisClickEvent = useYAxisIndexEdit({
      chartConfig: config.value as normalChartConfigType,
      onOk: (cfg) => {
        Object.assign(config.value, cfg);
        update();
      },
    });
    eventBus.push({
      event: yAxisClickEvent,
      eventType: 'contextmenu',
      target: 'yAxis',
    });
    // 编辑X轴
    const xAxisClickEvent = useXAxisIndexEdit({
      chartConfig: config.value as normalChartConfigType,
      onOk: (cfg) => {
        Object.assign(config.value, cfg);
        update();
      },
    });
    eventBus.push({
      event: xAxisClickEvent,
      eventType: 'contextmenu',
      target: 'xAxis',
    });
    // 支持折线图series右键菜单
    const lineContextMenuEvent = useLineChartContextMenu({
      chartConfig: config.value as normalChartConfigType,
      onOk: (cfg) => {
        Object.assign(config.value, cfg);
        update();
      },
    });
    eventBus.push({
      event: lineContextMenuEvent,
      eventType: 'contextmenu',
      target: 'series',
    });
    instance.on('dblclick', function (e) {
      if (props.paintMode) return;
      // 依次执行双击监听的所有事件
      eventBus
        .filter((event) => event.eventType === 'dblclick')
        .forEach((event) => {
          // 匹配对应类型的事件
          if (e.componentType === event.target) {
            const dom = createMountNode(e);
            e.instance = this;
            event.event(dom, e, instance.getOption());
          }
        });
    });
    instance.on('contextmenu', function (e) {
      if (props.paintMode) return;
      // 依次执行右键监听的所有事件
      eventBus
        .filter((event) => event.eventType === 'contextmenu')
        .forEach((event) => {
          // 匹配对应类型的事件
          if (e.componentType === event.target) {
            const dom = createMountNode(e);
            e.instance = this;
            event.event(dom, e, instance.getOption());
          }
        });
    });
    onUnmountedOrDeactivated(() => {
      stopResizeObserve();
      instance.off('contextmenu');
      instance.off('dblclick');
      eventBus.length = 0;
    });
  });
</script>

<style lang="less" scoped>
  .no-chart {
    position: absolute;
    width: 20%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
