<template>
  <AutoComplete
    class="w-full search-on"
    v-model:value="searchWord"
    :placeholder="t('component.search.searchQuota')"
    @search="handleSearch"
    @select="handleSelect"
    :options="searchList"
  >
    <Input>
      <template #suffix>
        <Icon icon="ic:twotone-search" />
      </template>
    </Input>
  </AutoComplete>
</template>

<script lang="ts" setup>
  import { useDebounceFn } from '@vueuse/shared';
  import { ref } from 'vue';
  import { AutoComplete, Input } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { searchQuota } from '@dq-next/http-apis/quota';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import type { searchItemType } from '../types';
  import { buildShortUUID } from '@dq-next/utils/uuid';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const emit = defineEmits<{
    (event: 'select', str: string, node: searchItemType);
  }>();

  const searchWord = ref('');
  const searchList = ref<searchItemType[]>([]);
  async function search(key) {
    searchList.value = [];
    try {
      searchList.value = (await searchQuota({ key })).map((item) => {
        return {
          label: item.shortName || item.name,
          value: `[${item.id}]${item.shortName || item.name}`,
          key: buildShortUUID(),
          categoryId: item.categoryId!,
        };
      });
    } catch (error) {
      createMessage.warn(t('common.searchResEmpty'));
    }
  }
  const handleSearch = useDebounceFn(search, 800);
  function handleSelect(key: string, node: searchItemType) {
    emit('select', key, node);
  }
</script>

<style lang="less" scoped>
  ::v-deep(.ant-input) {
    &:focus {
      box-shadow: none !important;
    }

    .ant-select {
      &:not(.ant-select-disabled):hover .ant-select-selector {
        border: none !important;
      }
    }
  }
</style>
