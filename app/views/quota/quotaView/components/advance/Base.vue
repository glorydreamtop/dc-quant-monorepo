<template>
  <div class="grid grid-cols-2 grid-rows-2 gap-2 ml-8">
    <Select
      size="small"
      @select="selectType"
      v-model:value="chartConfig.type"
      :options="chartTypeList"
    />
    <Color />
    <DatePicker
      size="small"
      :allowClear="false"
      v-model:value="chartConfig.timeConfig.startDate"
      value-format="YYYY-MM-DD"
      :showToday="false"
      :placeholer="t('quotaView.advance.baseSetting.startDate')"
    >
      <template #renderExtraFooter>
        <div class="flex items-center">
          <Input size="small" class="!w-10 text-center !mr-1" v-model:value="quickDateParams.num" />
          <RadioGroup button-style="solid" size="small" v-model:value="quickDateParams.unit">
            <RadioButton value="year">{{ t('quotaView.advance.baseSetting.year') }}</RadioButton>
            <RadioButton value="month">{{ t('quotaView.advance.baseSetting.month') }}</RadioButton>
            <RadioButton value="week">{{ t('quotaView.advance.baseSetting.week') }}</RadioButton>
            <RadioButton value="day">{{ t('quotaView.advance.baseSetting.day') }}</RadioButton>
          </RadioGroup>
          <span class="ml-auto cursor-pointer text-primary" @click="quickDate">{{
            t('common.okText')
          }}</span>
        </div>
      </template>
      <template #suffixIcon> </template>
    </DatePicker>
    <DatePicker
      size="small"
      :allowClear="false"
      v-model:value="chartConfig.timeConfig.endDate"
      value-format="YYYY-MM-DD"
      :placeholer="t('quotaView.advance.baseSetting.endDate')"
    >
      <template #suffixIcon> </template>
    </DatePicker>
  </div>
</template>

<script lang="ts" setup>
  import { DatePicker, Radio, Select } from 'ant-design-vue';
  import Color from '../Color.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useChartConfigContext } from '../hooks';
  import { chartTypeEnum } from '/@/enums/chartEnum';
  import { reactive } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { getChartDefaultConfig } from '../../helper';
  import { mergeAndRemove } from '@dq-next/utils/helper/commonHelper';
  import { dateUtil } from '@dq-next/utils/dateUtil';

  const { t } = useI18n();
  const RadioButton = Radio.Button;
  const RadioGroup = Radio.Group;
  const chartConfig = useChartConfigContext();
  // 图表类型下拉选择
  const chartTypeList: LabelValueOptions = [];
  for (let v in chartTypeEnum) {
    chartTypeList.push({
      label: t(`quotaView.advance.baseSetting.chartTypeList.${v}`),
      value: v,
      disabled: [chartTypeEnum.seasonalLunar].includes(v as chartTypeEnum),
    });
  }
  const quickDateParams = reactive({
    num: '1',
    unit: 'year',
  });
  function quickDate() {
    chartConfig.timeConfig.startDate = dateUtil()
      .subtract(parseInt(quickDateParams.num), quickDateParams.unit)
      .format('YYYY-MM-DD');
  }
  function selectType(type: chartTypeEnum) {
    // for (const key in chartConfig) {
    //   Reflect.deleteProperty(chartConfig, key);
    // }
    const def = getChartDefaultConfig(type);
    mergeAndRemove(chartConfig, def);
    console.log(cloneDeep(chartConfig));
  }
</script>

<style lang="less" scoped></style>
