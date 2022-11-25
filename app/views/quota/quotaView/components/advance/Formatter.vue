<template>
  <div class="grid grid-cols-2 pr-8 justify-items-end">
    <span class="label">
      <span>{{ t('quotaView.advance.valueFormatter.afterDot') }}</span>
      <InputNumber
        size="small"
        class="!w-10 min-w-10"
        :min="0"
        v-model:value="chartConfig.valueFormatter.afterDot"
      />
    </span>
    <span class="label">
      <span>{{ t('quotaView.advance.valueFormatter.normalized') }}</span>
      <Switch
        v-model:checked="chartConfig.valueFormatter.normalized"
        :checked-children="t('quotaView.advance.use')"
        :un-checked-children="t('quotaView.advance.stop')"
      />
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { Switch, InputNumber } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useChartConfigContext } from '../hooks';

  const { t } = useI18n();
  const chartConfig = useChartConfigContext();
</script>

<style lang="less" scoped></style>
