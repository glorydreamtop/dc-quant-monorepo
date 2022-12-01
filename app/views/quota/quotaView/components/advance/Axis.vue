<template>
  <div class="pl-8" v-if="showSettingFilter('yAxisEdit')">
    <div class="flex items-center gap-2">
      <YAxisEditor :chart-config="chartConfig" :idx="null" @update="updateConfig">
        <Button size="small">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          <span>{{ t('quotaView.advance.axisSetting.yAxis.createY') }}</span>
        </Button>
      </YAxisEditor>
      <BasicHelp :text="t('quotaView.advance.axisSetting.yAxis.tip2')" />
    </div>
    <div class="yAxisList">
      <Tag
        v-for="yAxis in yAxisIndexList"
        :key="yAxis.label"
        :closable="yAxis.closable"
        @close="delYAxis(yAxis.value)"
      >
        {{ yAxis.label }}
      </Tag>
    </div>
    <div class="flex items-center gap-2 mt-2">
      <XAxisEditor :chart-config="chartConfig" :idx="null" @update="updateConfig">
        <Button size="small">
          <template #icon>
            <Icon icon="ant-design:plus-outlined" />
          </template>
          <span>{{ t('quotaView.advance.axisSetting.xAxis.createX') }}</span>
        </Button>
      </XAxisEditor>
      <BasicHelp :text="t('quotaView.advance.axisSetting.yAxis.tip2')" />
    </div>
    <div class="yAxisList">
      <Tag
        v-for="xAxis in xAxisIndexList"
        :key="xAxis.label"
        :closable="xAxis.closable"
        @close="delXAxis(xAxis.value)"
      >
        {{ xAxis.label }}
      </Tag>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Tag, Button } from 'ant-design-vue';
  import { Icon } from '@dq-next/icon';
  import { BasicHelp } from '/@/components/Basic';
  import { YAxisEditor, XAxisEditor } from '@dq-next/dchart';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useChartConfigContext, useYAxisEdit, useSettingFilter, useXAxisEdit } from '../hooks';

  const { t } = useI18n();
  const chartConfig = useChartConfigContext();
  const showSettingFilter = useSettingFilter(chartConfig);
  function updateConfig(config) {
    Object.assign(chartConfig, config);
  }
  // Y轴编辑
  const [yAxisIndexList, { delYAxis }] = useYAxisEdit(chartConfig);
  const [xAxisIndexList, { delXAxis }] = useXAxisEdit(chartConfig);
</script>

<style lang="less" scoped>
  .yAxisList {
    margin-top: 0.5rem;
    margin-bottom: -0.5rem;

    ::v-deep(.ant-tag) {
      margin-bottom: 0.5rem;
    }
  }
</style>
