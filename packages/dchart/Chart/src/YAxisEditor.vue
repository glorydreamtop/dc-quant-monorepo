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
            {{ t('quotaView.advance.axisSetting.yAxis.index') }}
          </div>
          <span>{{ currentCfg.name }}</span>
          <!-- <span>{{ isNull(idx) ? chartConfig.yAxis.length + 1 : idx + 1 }}</span> -->
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.yAxis.position')
          }}</div>
          <RadioGroup
            size="small"
            v-model:value="currentCfg.position"
            @change="positionChange"
            button-style="solid"
          >
            <RadioButton value="left">{{
              t('quotaView.advance.axisSetting.yAxis.left')
            }}</RadioButton>
            <RadioButton value="right">{{
              t('quotaView.advance.axisSetting.yAxis.right')
            }}</RadioButton>
          </RadioGroup>
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.yAxis.min')
          }}</div>
          <Input
            size="small"
            class="!w-59px !min-w-59px"
            v-model:value="currentCfg.min"
            :disabled="currentCfg.alignZero"
            :placeholder="t('common.auto')"
            @blur="(e) => onInputNumber(e, 'min')"
          />
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.yAxis.max')
          }}</div>
          <Input
            size="small"
            class="!w-59px !min-w-59px"
            v-model:value="currentCfg.max"
            :disabled="currentCfg.alignZero"
            :placeholder="t('common.auto')"
            @blur="(e) => onInputNumber(e, 'max')"
          />
        </div>
        <div class="col-span-2"></div>
        <div class="col-span-2">
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.yAxis.color')
          }}</div>
          <div class="color-popover">
            <div
              v-for="color in currentColorScheme"
              :key="color"
              :title="color"
              :class="{
                'iconfont icon-checkmark': currentCfg.axisLine?.lineStyle?.color === color,
              }"
              :style="{ backgroundColor: color }"
              @click="colorChange(color)"
            ></div>
          </div>
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.yAxis.inverse')
          }}</div>
          <Switch size="small" v-model:checked="currentCfg.inverse" />
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.yAxis.showLine')
          }}</div>
          <Switch size="small" v-model:checked="currentCfg.axisLine.show" />
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.yAxis.magnitude')
          }}</div>
          <InputNumber
            size="small"
            class="!w-59px !min-w-59px"
            :min="0"
            v-model:value="scientificNotation"
          />
        </div>
        <div>
          <div class="min-w-3em text-justify mr-2">{{
            t('quotaView.advance.axisSetting.yAxis.offset')
          }}</div>
          <Input
            size="small"
            class="!w-38px !min-w-38px !mr-1"
            v-model:value="currentCfg.offset"
            @blur="(e) => onInputNumber(e, 'offset')"
          />
          <BasicHelp :text="t('quotaView.advance.axisSetting.yAxis.offsetTip')" />
        </div>
        <div class="flex gap-1 col-span-2">
          <Button size="small" block type="primary" @click="confirm">{{
            t('common.okText')
          }}</Button>
          <!-- <Button
            size="small"
            block
            type="primary"
            danger
            @click="del"
            v-show="props.idx !== null"
            >{{ t('common.removeText') }}</Button
          > -->
        </div>
      </div>
    </template>
    <div>
      <slot></slot>
    </div>
  </Popover>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';
  import { Input, Switch, Radio, Popover, Button, InputNumber } from 'ant-design-vue';
  import { cloneDeep, last, partition } from 'lodash-es';
  import { BasicHelp } from '/@/components/Basic';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { normalChartConfigType, YAxisOption } from '/#/chart';
  import { isNull } from '@dq-next/utils/is';
  import { useColor } from '../helper';
  // import { tooltipDirective as vTooltip } from '/@/directives/tooltip';
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
  const currentCfg: YAxisOption = reactive({
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
    position: 'left',
    name: '',
    axisLabel: {
      formatter: '{value}',
    },
    alignZero: false,
  });
  const colorChange = (color: string) => {
    currentCfg.axisLine.lineStyle.color = color;
  };
  const scientificNotation = ref(0);
  const placementMap = {
    left: 'right',
    right: 'left',
  };

  const placement = ref<'left' | 'right'>('right');
  // 数字格式化
  function onInputNumber(e: ChangeEvent, type: 'min' | 'max' | 'offset') {
    if (e.target.value === '') {
      currentCfg[type] = void 0;
      return;
    }
    currentCfg[type] = parseFloat(e.target.value);
  }
  const visible = ref(false);
  function setVisible(v) {
    visible.value = v;
  }
  defineExpose({ setVisible });
  watch(visible, (v) => {
    if (v) {
      getColorScheme();
      if (props.idx === null) {
        // 新增的智能分配到轴比较少的一侧
        const [leftAxis, rightAxis] = partition(props.chartConfig.yAxis!, (item) => {
          return item.position === 'left';
        });
        const isLeft = leftAxis.length < rightAxis.length;
        // 新轴的偏移量在最后一根同侧轴+40
        const offset =
          (isLeft ? last(leftAxis)?.offset ?? -40 : last(rightAxis)?.offset ?? -40) + 40;
        Object.assign(currentCfg, {
          offset: offset,
          position: isLeft ? 'left' : 'right',
          name: isLeft ? `左${leftAxis.length}` : `右${rightAxis.length}`,
        });
        scientificNotation.value = 0;
      } else {
        Object.assign(currentCfg, cloneDeep(props.chartConfig.yAxis[props.idx]));
        // @ts-ignore
        const formatter = props.chartConfig.yAxis[props.idx!].axisLabel!.formatter as string;
        scientificNotation.value = /pow/i.test(formatter)
          ? parseInt(formatter.match(/\d+/i)![0])
          : 0;
      }
      placement.value = placementMap[currentCfg.position!];
    }
    emit('visibleChange', v);
  });
  function positionChange() {
    // 新增的智能分配到轴比较少的一侧
    const [leftAxis, rightAxis] = partition(props.chartConfig.yAxis!, (item) => {
      return item.position === 'left';
    });
    const isLeft = currentCfg.position === 'left';
    currentCfg.offset =
      (isLeft ? last(leftAxis)?.offset ?? -40 : last(rightAxis)?.offset ?? -40) + 40;
  }
  function confirm() {
    const config = cloneDeep(props.chartConfig);
    if (scientificNotation.value > 0) {
      currentCfg.axisLabel!.formatter! = `pow${scientificNotation.value}`;
    } else {
      currentCfg.axisLabel!.formatter! = '{value}';
    }
    if (props.idx === null) {
      // 添加模式
      config.yAxis.push(cloneDeep(currentCfg));
    } else {
      // 修改模式
      Object.assign(config.yAxis[props.idx], currentCfg);
    }
    emit('update', config);
    setVisible(false);
  }
  const currentColorScheme = ref<string[]>([]);
  async function getColorScheme() {
    currentColorScheme.value = await useColor({ chartConfig: props.chartConfig });
  }
</script>

<style lang="less" scoped>
  .color-popover {
    @apply flex flex-wrap relative;

    gap: 4px;

    div {
      @apply w-4 h-4;

      border-radius: 2px;
    }

    .icon-checkmark {
      position: relative;

      &::before {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 12px;
        width: 16px;
        height: 16px;
        text-align: center;
        color: @white;
      }
    }
  }
</style>
