<template>
  <div class="toolbar bg-white border">
    <Tooltip placement="left">
      <template #title>
        {{ t('quota.toolbar.upload') }}
      </template>
      <Icon
        v-repeat-click="openModal"
        class="cursor-pointer !text-primary"
        :size="24"
        icon="ci:cloud-up"
      />
    </Tooltip>
    <Tooltip placement="left">
      <template #title>
        {{ t('quota.toolbar.update') }}
      </template>
      <Icon
        v-repeat-click="getData"
        :class="[
          'cursor-pointer !text-primary animate__animated',
          loading === 1 ? 'animate__flash' : '',
        ]"
        :size="24"
        :icon="['ci:cloud-close', 'ci:cloud-down', 'ci:cloud-check'][loading]"
      />
    </Tooltip>
  </div>
  <QuotaUpload @register="registerQuotaUpload" />
</template>

<script lang="ts" setup>
  import { useModal } from '../../Modal';
  import { Icon } from '@dq-next/icon';
  import { Tooltip } from 'ant-design-vue';
  import { QuotaUpload } from '/@/components/QuotaEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineProps<{
    loading: number;
  }>();
  const emit = defineEmits<{
    (event: 'getData'): void;
  }>();

  const { t } = useI18n();
  const [registerQuotaUpload, { openModal: openQuotaUpload }] = useModal();
  function getData() {
    emit('getData');
  }
  function openModal() {
    openQuotaUpload(true);
  }
</script>

<style lang="less" scoped>
  .toolbar {
    @apply shadow-gray-400;
    @apply shadow;
    @apply p-1;

    position: absolute;
    top: 90px;
    right: 16px;
    font-size: 20px !important;
    z-index: 9;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
</style>
