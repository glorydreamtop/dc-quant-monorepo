<template>
  <Popover v-bind="$attrs" trigger="click" v-model:visible="visible" destroyTooltipOnHide>
    <template #content>
      <div
        class="flex flex-col gap-1 children:whitespace-nowrap children:flex children:items-center w-40"
      >
        <span :style="{ color: info.color }">{{ info.name }}</span>
        <span>{{info.currentPoint}}</span>
        <span>
          <span class="w-4em text-justify mr-2">{{ t('quotaView.seriesEdit.legendName') }}</span>
          <Input class="!w-6em" size="small" v-model:value="info.legendName" placeholder="默认" />
        </span>
        <span>
          <span class="w-4em text-justify mr-2">{{ t('quotaView.seriesEdit.seriesType') }}</span>
          <Select
            class="!w-6em"
            size="small"
            v-model:value="info.seriesType"
            :options="availableSeriesType"
          />
        </span>
        <span v-if="info.lineType !== void 0">
          <span class="w-4em text-justify mr-2">{{ t('quotaView.seriesEdit.lineType') }}</span>
          <Select
            class="!w-6em"
            size="small"
            v-model:value="info.lineType"
            :options="lineTypeList"
          />
        </span>
        <span v-if="info.lineType !== void 0">
          <span class="w-4em text-justify mr-2">{{ t('quotaView.seriesEdit.symbol') }}</span>
          <Switch size="small" v-model:checked="info.symbol" />
        </span>
        <span v-if="info.size !== void 0">
          <span class="w-4em text-justify mr-2">{{ t('quotaView.seriesEdit.lineWidth') }}</span>
          <InputNumber
            :step="2"
            class="!text-center !w-6em"
            size="small"
            v-model:value="info.size"
          />
        </span>
        <span v-if="info.shadow !== void 0">
          <span class="w-4em text-justify mr-2">{{ t('quotaView.seriesEdit.lineShadow') }}</span>
          <Switch size="small" v-model:checked="info.shadow" />
        </span>
        <span v-if="info.yAxisIndex !== void 0">
          <span class="w-4em text-justify mr-2">{{ t('quotaView.seriesEdit.yAxisIndex') }}</span>
          <Select
            class="!w-4em !text-center y-selector"
            size="small"
            :disabled="quickYAxis"
            v-model:value="info.yAxisIndex"
            :options="yAxisList"
          />
          <Tooltip
            :title="
              quickYAxis
                ? t('quotaView.seriesEdit.quickYAxisTip')
                : t('quotaView.seriesEdit.quickYAxis')
            "
          >
            <Icon
              :class="['ml-1', quickYAxis ? '!text-green-600' : '!text-primary']"
              size="20"
              :icon="
                quickYAxis ? 'ant-design:check-circle-outlined' : 'ant-design:plus-circle-outlined'
              "
              @click="addYAxis"
            />
          </Tooltip>
        </span>
        <span v-if="info.xAxisIndex !== void 0">
          <span class="w-4em text-justify mr-2">{{ t('quotaView.seriesEdit.xAxisIndex') }}</span>
          <Select
            class="!w-4em !text-center y-selector"
            size="small"
            :disabled="quickXAxis"
            v-model:value="info.xAxisIndex"
            :options="xAxisList"
          />
          <Tooltip
            :title="
              quickXAxis
                ? t('quotaView.seriesEdit.quickXAxisTip')
                : t('quotaView.seriesEdit.quickXAxis')
            "
          >
            <Icon
              :class="['ml-1', quickXAxis ? '!text-green-600' : '!text-primary']"
              size="20"
              :icon="
                quickXAxis ? 'ant-design:check-circle-outlined' : 'ant-design:plus-circle-outlined'
              "
              @click="addXAxis"
            />
          </Tooltip>
        </span>
        <div class="mt-2 flex gap-1">
          <Button size="small" block type="primary" @click="confirm">{{
            t('common.okText')
          }}</Button>
        </div>
      </div>
    </template>
    <div>
      <slot></slot>
    </div>
  </Popover>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch, toRaw, computed } from 'vue';
  import { Popover, Button, Switch, Select, InputNumber, Input, Tooltip } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { cloneDeep, difference, last, merge, partition } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { normalChartConfigType, seriesSettingType } from '/#/chart';
  import { echartLineTypeEnum, echartSeriesTypeEnum } from '/@/enums/chartEnum';
  import { EChartsOption } from 'echarts';
  import { setSeriesInfo } from '../helper';
  import { disableSeriesType } from './disableSeries';

  const { t } = useI18n();
  const emit = defineEmits<{
    (event: 'update', chartConfig: normalChartConfigType);
    (event: 'visibleChange', visible: boolean);
    (event: 'addYAxis', yAxis);
    (event: 'addXAxis', xAxis);
  }>();
  const props = defineProps<{
    chartConfig: normalChartConfigType;
    seriesInfo: any;
    options: EChartsOption;
  }>();
  const info: seriesSettingType = reactive({
    name: '',
    size: void 0,
    seriesType: echartSeriesTypeEnum.line,
    lineType: void 0,
    shadow: void 0,
    yAxisIndex: void 0,
    xAxisIndex: void 0,
    color: void 0,
    symbol: void 0,
    legendName: void 0,
    symbolPoints:[],
    currentPoint:[]
  });
  const yAxisList = computed(() => {
    const { chartConfig } = props;
    const { yAxis } = chartConfig;
    return yAxis.map((item, index) => {
      return {
        value: index + 1,
        label: item.name,
      };
    });
  });
  const xAxisList = computed(() => {
    const { chartConfig } = props;
    const { xAxis } = chartConfig;
    return xAxis.map((item, index) => {
      return {
        value: index + 1,
        label: item.name,
      };
    });
  });
  const availableSeriesType = computed(() => {
    return difference(
      [
        echartSeriesTypeEnum.line,
        echartSeriesTypeEnum.bar,
        echartSeriesTypeEnum.scatter,
        echartSeriesTypeEnum.smoothLine,
        echartSeriesTypeEnum.area,
        echartSeriesTypeEnum.radar,
        echartSeriesTypeEnum.pie,
      ],
      disableSeriesType[props.chartConfig.type],
    ).map((name) => {
      return {
        label: t(`quotaView.seriesEdit.seriesTypeList.${name}`),
        value: name,
      };
    });
  });
  const lineTypeList = computed(() => {
    return [echartLineTypeEnum.solid, echartLineTypeEnum.dashed, echartLineTypeEnum.dotted].map(
      (name) => {
        return {
          label: t(`quotaView.seriesEdit.lineTypeList.${name}`),
          value: name,
        };
      },
    );
  });
  const quickYAxis = ref(false);
  const quickXAxis = ref(false);
  function addYAxis() {
    if (quickYAxis.value) return;
    info.yAxisIndex = props.chartConfig.yAxis.length + 1;
    quickYAxis.value = true;
    // 新增的智能分配到轴比较少的一侧
    const [leftAxis, rightAxis] = partition(props.chartConfig.yAxis!, (item) => {
      return item.position === 'left';
    });
    const isLeft = leftAxis.length < rightAxis.length;
    // 新轴的偏移量在最后一根同侧轴+40
    const offset = (isLeft ? last(leftAxis)?.offset ?? -40 : last(rightAxis)?.offset ?? -40) + 40;
    const yAxis = {
      min: void 0,
      max: void 0,
      inverse: false,
      offset: offset,
      name: isLeft ? `左${leftAxis.length + 1}` : `右${rightAxis.length + 1}`,
      axisLine: {
        show: true,
        lineStyle: {
          color: info.color,
        },
      },
      position: isLeft ? 'left' : 'right',
      axisLabel: {
        formatter: '{value}',
      },
    };
    emit('addYAxis', yAxis);
    info.legendName?.replace(/\|(左|右)\d+/g, '');
    info.legendName = `${info.legendName?.length ? info.legendName : info.name}|${yAxis.name}`;
  }
  function addXAxis() {
    if (quickXAxis.value) return;
    info.xAxisIndex = props.chartConfig.xAxis.length + 1;
    quickXAxis.value = true;
    // 新增的智能分配到轴比较少的一侧
    const [bottomAxis, topAxis] = partition(props.chartConfig.xAxis!, (item) => {
      return item.position === 'bottom';
    });
    const isBottom = bottomAxis.length < topAxis.length;
    // 新轴的偏移量在最后一根同侧轴+40
    const offset = (isBottom ? last(bottomAxis)?.offset ?? -40 : last(topAxis)?.offset ?? -40) + 40;
    const xAxis = {
      min: void 0,
      max: void 0,
      inverse: false,
      offset: offset,
      name: isBottom ? `下${bottomAxis.length + 1}` : `上${topAxis.length + 1}`,
      axisLine: {
        show: true,
        lineStyle: {
          color: info.color,
        },
      },
      position: isBottom ? 'bottom' : 'top',
      axisLabel: {
        formatter: '{yyyy}/{M}/{d}',
        rotate: 0,
      },
    };
    emit('addXAxis', xAxis);
    info.legendName?.replace(/\|(下|上)\d+/g, '');
    // info.legendName = `${info.legendName?.length ? info.legendName : info.name}|${xAxis.name}`;
  }
  const visible = ref(false);
  function setVisible(v) {
    visible.value = v;
  }
  defineExpose({ setVisible });
  watch(visible, (v) => {
    if (v) {
      setSeriesInfo({ info, ...props });
    }
    emit('visibleChange', v);
  });
  // 确认并关闭
  function confirm() {
    const config = cloneDeep(props.chartConfig);
    const series = config.seriesSetting.find((ser) => ser.name === info.name);
    const cloneInfo = cloneDeep(toRaw(info));
    cloneInfo.yAxisIndex! -= 1;
    cloneInfo.xAxisIndex! -= 1;
    if (series) {
      merge(series, cloneInfo);
    } else {
      config.seriesSetting.push(cloneInfo);
    }
    emit('update', config);
    setVisible(false);
  }
</script>

<style lang="less" scoped>
  ::v-deep(.ant-input-number-input-wrap) {
    width: 2em !important;
  }

  ::v-deep(.ant-input-number) {
    min-width: 0 !important;
  }

  .y-selector {
    ::v-deep(.ant-select-selection-item) {
      text-overflow: unset;
    }
  }
</style>
