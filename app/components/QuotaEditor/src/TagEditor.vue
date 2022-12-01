<template>
  <BasicModal v-bind="modalProps" @register="registerModal" @ok="updateQuotaTag" @cancel="cancel">
    <div class="flex gap-4 h-280px">
      <div class="w-50 flex-shrink-0">
        <span>{{ t('quotaView.tagEdit.searchPlaceholder') }}</span>
        <Select
          class="w-full !mt-2"
          show-search
          v-model:value="params.tagName"
          @search="handleSearch"
          @select="handleSelect"
          :default-active-first-option="false"
          optionLabelProp="label"
          :options="params.searchResult.map((tag) => ({ label: tag.tagName, value: tag.id }))"
        >
          <template v-if="params.loading" #notFoundContent>
            <Icon class="loading" icon="ant-design:loading-outlined" />
          </template>
          <template #dropdownRender="{ menuNode }">
            <div class="py-1 px-3 flex justify-between bg-primary hover:bg-gray-100 cursor-pointer">
              <span class="truncate">{{ params.tagName }}</span>
              <Button :disabled="!params.tagName" type="primary" size="small">{{
                t('quotaView.tagEdit.createTag')
              }}</Button>
            </div>
            <VNodes :vnodes="menuNode" />
          </template>
        </Select>
      </div>

      <div class="h-full flex flex-col flex-grow border border-gray-300 p-2">
        <div class="h-10 leading-8 text-lg flex items-center">
          <Icon class="!text-primary" size="28" icon="ant-design:tags-outlined" />
          <span class="ml-2">{{ t('quotaView.tagEdit.tagList') }}</span>
        </div>
        <div class="w-full flex-grow overflow-y-scroll p-2">
          <Tag
            :class="[
              'tags',
              params.repeatTag.id === tag.id ? 'animate__animated animate__heartBeat' : '',
            ]"
            :style="{
              borderColor: getColorScheme[index % colors.length],
              color: getColorScheme[index % colors.length],
            }"
            :color="colors[index % colors.length]"
            v-for="(tag, index) in params.tagList"
            :key="tag.id"
            closable
          >
            {{ tag.tagName }}
          </Tag>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, reactive } from 'vue';
  import type { ModalProps } from 'ant-design-vue';
  import { Select, Tag, Button } from 'ant-design-vue';
  import { useModalInner, BasicModal } from '../../Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { addTagToQuota, getTagLike } from '@dq-next/http-apis/tags';
  import type { TagOption } from '@dq-next/http-apis/tags';
  import { useDebounceFn } from '@vueuse/shared';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { fade } from '@dq-next/utils/color';
  import { LabeledValue } from 'ant-design-vue/lib/select';
  import { QuotaItem } from '/#/quota';
  import { Icon } from '@dq-next/icon';

  interface Params {
    searchName: string;
    tagName: string;
    loading: boolean;
    searchResult: TagOption[];
    tagList: TagOption[];
    repeatTag: {
      id: number;
      tagName: string;
    };
    quotaList: QuotaItem[];
  }
  const { t } = useI18n();
  function VNodes(_, { attrs }) {
    return attrs.vnodes;
  }
  const modalProps: Partial<ModalProps> = reactive({
    title: t('quotaView.tagEdit.modalTitle'),
    okText: t('common.saveText'),
    width: 800,
    minHeight: 300,
  });

  const { getColorScheme } = useRootSetting();

  const colors = computed(() => {
    return getColorScheme.value.map((color) => fade(color, 30));
  });

  const params: Params = reactive({
    searchName: '',
    tagName: '',
    loading: false,
    searchResult: [],
    tagList: [],
    repeatTag: {
      id: 0,
      tagName: '',
    },
    quotaList: [],
  });
  async function searchTag(tagName: string) {
    params.searchName = tagName;
    params.tagName = tagName;
    params.loading = true;
    params.searchResult = await getTagLike(tagName);
    params.loading = false;
  }
  const handleSearch = useDebounceFn(searchTag, 800);
  function handleSelect(_, node: LabeledValue) {
    if (params.tagList.some((tag) => tag.id === node.value)) {
      params.repeatTag = { tagName: node.label as string, id: node.value as number };
      setTimeout(() => {
        params.repeatTag = { tagName: '', id: 0 };
      }, 1500);
    } else {
      params.tagList.push({ tagName: node.label as string, id: node.value as number });
    }
  }
  async function updateQuotaTag() {
    await addTagToQuota({
      idList: params.tagList.map((tag) => tag.id),
      indexList: params.quotaList.map((item) => item.id),
    });
  }
  function cancel() {
    closeModal();
  }

  const [registerModal, { closeModal }] = useModalInner((quotaList: QuotaItem[]) => {
    params.quotaList = quotaList;
  });
</script>

<style lang="less" scoped>
  .tags {
    @apply text-sm;

    border: 1px solid;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.25rem 0.5rem;
  }

  ::v-deep(.anticon-close.ant-tag-close-icon) {
    transform: translateY(-3px);
  }

  .loading {
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
