<template>
  <div class="grid grid-cols-2 pr-8 justify-items-end">
    <span class="label">
      <span>{{ t('quotaView.advance.rectSetting.lastest') }}</span>
      <Switch
        :checked-children="t('quotaView.advance.show')"
        :un-checked-children="t('quotaView.advance.hide')"
        v-model:checked="chartConfig.showLastest"
      />
    </span>
    <span class="label">
      <span>{{ t('quotaView.advance.rectSetting.highest') }}</span>
      <Switch
        :checked-children="t('quotaView.advance.show')"
        :un-checked-children="t('quotaView.advance.hide')"
        v-model:checked="chartConfig.showHighest"
      />
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { Switch } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useChartConfigContext } from '../hooks';

  const { t } = useI18n();
  const chartConfig = useChartConfigContext();
</script>

<style lang="less" scoped></style>
