<template>
  <div class="p-4 h-layout-full flex gap-4">
    <div class="h-full min-w-90 w-90 relative border shadow-md" v-resizeable:show="`x`">
      <QuotaTree :show-search="true" class="h-full w-full enter-y" @selectNode="selectNode" />
    </div>
    <QuotaPool />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { QuotaTree } from '/@/components/QuotaTree';
  import { createSelectedQuotaContext, createQuotaListContext, SelectedQuotaItem } from './hooks';
  import QuotaPool from './components/QuotaPool.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  const selectedQuotaList = ref<SelectedQuotaItem[]>([]);
  const quotaList = ref<SelectedQuotaItem[]>([]);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  createSelectedQuotaContext(selectedQuotaList);
  createQuotaListContext(quotaList);
  function selectNode(quota: SelectedQuotaItem) {
    quota.selected = true;
    if (selectedQuotaList.value.some((q) => q.id === quota.id)) {
      createMessage.warn(t('quotaView.uniqSelectedQuotaMessage'));
    } else {
      selectedQuotaList.value.push(quota);
    }
  }
</script>

<style lang="less" scoped></style>
