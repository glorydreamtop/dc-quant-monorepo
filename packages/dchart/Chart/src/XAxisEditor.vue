<template>
  <Popover
    v-bind="$attrs"
    trigger="click"
    v-model:visible="visible"
    :placement="placement"
    destroyTooltipOnHide
  >
    <template #content>
      <div
        class="grid grid-cols-2 gap-1 children:whitespace-nowrap children:flex children:items-center w-60"
      >
        <div>
          <div class="w-3em text-justify mr-2">
            {{ t('quotaView.advance.axisSetting.xAxis.index') }}
          </div>
          <span>{{ currentCfg.name }}</span>
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.xAxis.position')
          }}</div>
          <RadioGroup
            size="small"
            v-model:value="currentCfg.position"
            @change="positionChange"
            button-style="solid"
          >
            <RadioButton value="bottom">{{
              t('quotaView.advance.axisSetting.xAxis.bottom')
            }}</RadioButton>
            <RadioButton value="top">{{
              t('quotaView.advance.axisSetting.xAxis.top')
            }}</RadioButton>
          </RadioGroup>
        </div>
        <div v-if="xAxisType === 'time'" class="col-span-2 flex">
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.xAxis.min')
          }}</div>
          <DatePicker
            class="flex-grow"
            size="small"
            v-model:value="currentCfg.min"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div v-if="xAxisType === 'time'" class="col-span-2 flex">
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.xAxis.max')
          }}</div>
          <DatePicker
            class="flex-grow"
            size="small"
            v-model:value="currentCfg.max"
            value-format="YYYY-MM-DD"
          />
        </div>

        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.xAxis.inverse')
          }}</div>
          <Switch size="small" v-model:checked="currentCfg.inverse" />
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.xAxis.showLine')
          }}</div>
          <Switch size="small" v-model:checked="currentCfg.axisLine.show" />
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.xAxis.rotate')
          }}</div>
          <Input
            size="small"
            class="!w-42px !min-w-42px !mr-1"
            v-model:value="currentCfg.axisLabel.rotate"
            suffix="°"
            @blur="(e) => onInputNumber(e, 'axisLabel.rotate')"
          />
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.xAxis.offset')
          }}</div>
          <Input
            size="small"
            class="!w-38px !min-w-38px !mr-1"
            v-model:value="currentCfg.offset"
            @blur="(e) => onInputNumber(e, 'offset')"
          />
          <BasicHelp :text="t('quotaView.advance.axisSetting.xAxis.offsetTip')" />
        </div>
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
  import { computed, reactive, ref, watch } from 'vue';
  import { Input, Switch, Radio, Popover, Button, DatePicker } from 'ant-design-vue';
  import { cloneDeep, last, partition, set } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { normalChartConfigType, XAxisOption } from '/#/chart';
  import { chartTypeEnum } from '/@/enums/chartEnum';
  const { t } = useI18n();

  const RadioGroup = Radio.Group;
  const RadioButton = Radio.Button;
  const props = defineProps<{
    chartConfig: normalChartConfigType;
    idx: Nullable<number>;
  }>();
  const emit = defineEmits<{
    (event: 'update', chartConfig: normalChartConfigType);
    (event: 'visibleChange', visible: boolean);
  }>();
  const currentCfg: XAxisOption = reactive({
    min: void 0,
    max: void 0,
    inverse: false,
    offset: 0,
    axisLine: {
      show: true,
      lineStyle: {
        color: '#999999',
      },
    },
    position: 'bottom',
    name: '',
    axisLabel: {
      formatter: '{yyyy}/{M}/{d}',
      rotate: 0,
    },
    alignZero: false,
  });
  const placementMap = {
    top: 'bottom',
    bottom: 'top',
  };

  const placement = ref<'top' | 'bottom'>('top');
  // 数字格式化
  function onInputNumber(e: ChangeEvent, type: 'min' | 'max' | 'offset' | 'axisLabel.rotate') {
    if (e.target.value === '') {
      currentCfg[type] = void 0;
      return;
    }
    set(currentCfg, type, parseFloat(e.target.value));
  }
  const visible = ref(false);
  function setVisible(v) {
    visible.value = v;
  }
  defineExpose({ setVisible });
  const xAxisType = computed(() => {
    return [chartTypeEnum.normal, chartTypeEnum.seasonal].includes(props.chartConfig.type)
      ? 'time'
      : 'category';
  });
  watch(visible, (v) => {
    if (v) {
      if (props.idx === null) {
        // 新增的智能分配到轴比较少的一侧
        const [bottomAxis, topAxis] = partition(props.chartConfig.xAxis!, (item) => {
          return item.position === 'bottom';
        });
        const isBottom = bottomAxis.length < topAxis.length;
        // 新轴的偏移量在最后一根同侧轴+40
        const offset =
          (isBottom ? last(bottomAxis)?.offset ?? -40 : last(bottomAxis)?.offset ?? -40) + 40;
        Object.assign(currentCfg, {
          offset: offset,
          position: isBottom ? 'bottom' : 'top',
          name: isBottom ? `下${bottomAxis.length}` : `上${topAxis.length}`,
        });
      } else {
        Object.assign(currentCfg, cloneDeep(props.chartConfig.xAxis[props.idx]));
        // @ts-ignore
        const formatter = props.chartConfig.xAxis[props.idx!].axisLabel!.formatter as string;
      }
      placement.value = placementMap[currentCfg.position!];
    }
    emit('visibleChange', v);
  });
  function positionChange() {
    // 新增的智能分配到轴比较少的一侧
    const [bottomAxis, topAxis] = partition(props.chartConfig.xAxis!, (item) => {
      return item.position === 'left';
    });
    const isBottom = currentCfg.position === 'left';
    currentCfg.offset =
      (isBottom ? last(bottomAxis)?.offset ?? -40 : last(topAxis)?.offset ?? -40) + 40;
  }
  function confirm() {
    const config = cloneDeep(props.chartConfig);
    if (props.idx === null) {
      // 添加模式
      config.xAxis.push(currentCfg);
    } else {
      // 修改模式
      Object.assign(config.xAxis[props.idx], currentCfg);
    }
    emit('update', config);
    setVisible(false);
  }
</script>

<style lang="less" scoped></style>
