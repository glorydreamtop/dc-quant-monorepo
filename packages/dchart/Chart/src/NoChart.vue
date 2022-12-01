<template>
  <div v-if="props.noChart" class="no-chart flex flex-col items-center select-none">
    <img src="../../../../app/assets/svg/no-chart.svg" />
    <span v-if="props.title" class="whitespace-nowrap mt-2 text-gray-400 flex flex-col items-center"
      ><span>{{ props.title }}</span
      ><span v-if="props.renderError">{{ t('common.renderError') }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    // 还没画图
    noChart: boolean;
    // 渲染出错
    renderError: boolean;
    title: string;
  }>();

  const { t } = useI18n();
</script>

<style lang="less" scoped></style>
