<template>
  <div class="toolbar bg-white border">
    <Icon
      v-repeat-click="getData"
      :class="['cursor-pointer !text-primary animate__animated', loading ? ' animate__flash' : '']"
      :size="20"
      icon="CloudSync|svg"
    />
    <Icon
      v-repeat-click="openModal"
      class="cursor-pointer !text-primary"
      :size="20"
      icon="ant-design:cloud-upload-outlined"
    />
  </div>
  <QuotaUpload @register="registerQuotaUpload" />
</template>

<script lang="ts" setup>
  import { toRefs } from 'vue';
  import { useModal } from '../../Modal';
  import Icon from '/@/components/Icon';
  import { QuotaUpload } from '/@/components/QuotaEditor';

  const props = defineProps<{
    loading: boolean;
  }>();
  const emit = defineEmits<{
    (event: 'getData'): void;
  }>();

  const { loading } = toRefs(props);
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
