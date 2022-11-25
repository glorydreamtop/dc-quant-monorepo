<template>
  <div class="flex gap-4 bg-white p-4">
    <Button type="primary" @click="createReport">
      <template #icon>
        <Icon icon="ant-design:plus-outlined" />
      </template>
      <span>{{ t('report.reportList.createReport') }}</span>
    </Button>
    <span class="flex items-center gap-1">
      <span class="label">{{ t('report.reportList.list.userName') }}</span>
      <Input allow-clear class="max-w-40" v-model:value="filterOptions.username" />
    </span>
    <span class="flex items-center gap-1">
      <span class="label">{{ t('report.reportList.list.productName') }}</span>
      <TreeSelect
        class="!w-40"
        v-model:value="filterOptions.productId"
        :tree-data="store.getProductTree"
        :fieldNames="replaceFields"
        :loading="loadingState.productSelect"
        allow-clear
      />
    </span>
    <span class="flex gap-1 items-center">
      <Button @click="filterReportList" type="primary">
        <template #icon>
          <Icon icon="ant-design:search-outlined" />
        </template>
        <span>{{ t('common.queryText') }}</span>
      </Button>
      <Button @click="resetFilter">{{ t('common.resetText') }}</Button>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Button, TreeSelect, Input } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { useQuotaTreeStore } from '/@/store/modules/quotaTree';

  const emits = defineEmits<{
    (event: 'updateReportList', options: typeof filterOptions): void;
  }>();

  const { t } = useI18n();
  const store = useQuotaTreeStore();

  const loadingState = reactive({
    productSelect: false,
    userTable: false,
  });

  const filterOptions = reactive({
    username: '',
    productId: undefined,
  });

  const replaceFields = {
    label: 'name',
    value: 'id',
    key: 'id',
  };

  function resetFilter() {
    filterOptions.productId = undefined;
    filterOptions.username = '';
    filterReportList();
  }

  function filterReportList() {
    emits('updateReportList', filterOptions);
  }
</script>

<style lang="less" scoped>
  .label::after {
    content: ':';
  }
</style>
