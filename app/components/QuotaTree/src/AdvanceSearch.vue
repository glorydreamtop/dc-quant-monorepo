<template>
  <BasicModal @register="registerModal" v-bind="modalProps" @ok="ok" @cancel="close">
    <div class="mb-2" ref="searchRef">
      <Tabs v-model:activeKey="searchNOC">
        <TabPane :key="false" tab="全局搜索">
          <div class="flex gap-2 mb-2">
            <Select
              class="!w-36"
              :options="sourceTypeList"
              v-model:value="searchKey.sourceType"
              allowClear
              placeholder="指标类型"
            />
            <Input
              allowClear
              v-model:value="searchKey.idRange"
              placeholder="输入ID范围，例102300-102400"
            />
          </div>
          <div class="flex gap-2">
            <Input
              allowClear
              v-model:value="searchKey.key"
              placeholder="输入指标ID/名字/代码搜索"
            />
            <Button type="primary" @click="search">
              <Icon icon="ant-design:search-outlined" />
              <span>搜索</span>
            </Button>
          </div>
        </TabPane>
        <TabPane :key="true" tab="无目录指标搜索" force-render>
          <div class="flex gap-2">
            <Input
              allowClear
              v-model:value="nocSearchKey.key"
              placeholder="输入Code/Name/SourceCode/Description搜索"
            />
            <Button type="primary" @click="nocSearch">
              <Icon icon="ant-design:search-outlined" />
              <span>搜索</span>
            </Button>
          </div>
        </TabPane>
      </Tabs>
      <div class="flex items-center gap-4 mt-2">
        <Button size="small" @click="checkAll">
          <Icon icon="ant-design:check-outlined" />
          <span>全选/取消全选</span>
        </Button>
      </div>
    </div>
    <div v-loading="loading" class="relative" :style="{ height: scrollHeight + 'px' }">
      <VScroll
        :itemHeight="40"
        :items="searchResult"
        :height="scrollHeight"
        v-if="searchResult.length > 0"
      >
        <template #default="{ item }">
          <div
            class="flex items-center h-8 gap-2 px-2 text-white searchres-item children:truncate"
            :class="[item.selected ? 'bg-primary' : 'bg-gray-400']"
            @click="item.selected = !item.selected"
          >
            <span class="text-center w-3em">{{ item.index }}</span>
            <Tooltip :title="item.id">
              <span class="w-20 text-center min-w-20">{{ item.id }}</span>
            </Tooltip>
            <Tooltip :title="item.name">
              <span class="text-center min-w-30 w-60">{{ item.name }}</span>
            </Tooltip>
            <Tooltip :title="item.sourceCode">
              <span class="text-center min-w-20 w-30">{{ item.sourceCode ?? '无数据代码' }}</span>
            </Tooltip>
            <span class="text-center w-4em">{{ typeFomatter(item.sourceType) }}</span>
          </div>
        </template>
      </VScroll>
      <img class="w-60 no-data" v-if="searchResult.length === 0" :src="naDataSvg" alt="" />
      <Pagination
        class="!mt-1"
        size="small"
        v-if="searchNOC && searchResult.length > 0"
        show-size-changer
        v-model:current="nocSearchKey.currPage"
        v-model:pageSize="nocSearchKey.pageSize"
        :total="nocSearchKey.totalCount"
        @change="nocSearch"
      />
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { reactive, ref, watchEffect, toRaw, onMounted, nextTick, unref } from 'vue';
  import type { Ref } from 'vue';
  import { Input, Select, Button, Tooltip, Tabs, Pagination } from 'ant-design-vue';
  import type { ModalProps } from '/@/components/Modal/src/typing';
  import Icon from '/@/components/Icon';
  import { VScroll } from '/@/components/VirtualScroll';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SourceTypeEnum, SourceTypeNameEnum } from '/@/enums/quotaEnum';
  import { getNOCQuota, searchQuota } from '@dq-next/http-apis/quota';
  import { typeFomatter } from '@dq-next/utils/helper/commonHelper';
  import { useMagicKeys, useResizeObserver } from '@vueuse/core';
  import { SelectedQuotaItem } from '/@/views/quota/quotaView/components/hooks';
  import { cloneDeep, omit } from 'lodash-es';
  import naDataSvg from '/@/assets/svg/no-data.svg';

  const TabPane = Tabs.TabPane;
  interface searchKeyType {
    sourceType?: SourceTypeEnum;
    key: string;
    idRange: string;
  }
  const emit = defineEmits<{
    (event: 'pushQuota', list: SelectedQuotaItem[]): void;
  }>();
  const { t } = useI18n();
  const { Ctrl_A } = useMagicKeys({
    passive: false,
    onEventFired(e) {
      if (e.ctrlKey && e.key === 'a' && e.type === 'keydown') {
        e.preventDefault();
      }
    },
  });
  watchEffect(() => {
    if (Ctrl_A.value) searchResult.value.forEach((item) => (item.selected = true));
  });

  const scrollHeight = ref(0);
  const searchRef: Ref<HTMLElement | undefined> = ref();

  const [registerModal, { closeModal }] = useModalInner();
  const searchResult: Ref<SelectedQuotaItem[]> = ref([]);
  const modalProps: Partial<ModalProps> = reactive({
    title: t('quotaView.management.search.title'),
    okText: '添加到列表',
    minHeight: 500,
  });
  const searchKey: searchKeyType = reactive({
    sourceType: undefined,
    key: '',
    idRange: '',
  });
  const nocSearchKey = reactive({
    pageSize: 40,
    currPage: 1,
    key: '',
    totalCount: 40,
  });
  const loading = ref(false);
  const searchNOC = ref(false);
  async function search() {
    loading.value = true;
    try {
      const res = await searchQuota({
        ...toRaw(searchKey),
      });
      if (res.length > 0) {
        searchResult.value = res.map((item, index) => {
          const q = cloneDeep(item) as SelectedQuotaItem;
          q.index = index + 1;
          q.selected = true;
          return q;
        });
      }
    } catch (error) {
    } finally {
      loading.value = false;
    }
  }
  async function nocSearch() {
    loading.value = true;
    try {
      const { list, totalCount } = await getNOCQuota(omit(toRaw(nocSearchKey), ['totalCount']));
      nocSearchKey.totalCount = totalCount;
      if (list.length > 0) {
        searchResult.value = list.map((item, index) => {
          const q = cloneDeep(item) as SelectedQuotaItem;
          q.index = index + 1;
          q.selected = true;
          return q;
        });
      } else {
        searchResult.value = [];
      }
    } catch (error) {
    } finally {
      loading.value = false;
    }
  }
  function checkAll() {
    const allSelected = searchResult.value.some((item) => !item.selected);
    searchResult.value.forEach((item) => (item.selected = allSelected));
  }
  function ok() {
    emit(
      'pushQuota',
      unref(searchResult).filter((item) => item.selected),
    );
    close();
  }
  function close() {
    searchKey.idRange = '';
    searchKey.key = '';
    searchKey.sourceType = undefined;
    searchResult.value = [];
    nocSearchKey.currPage = 1;
    nocSearchKey.pageSize = 40;
    nocSearchKey.key = '';
    nocSearchKey.totalCount = 40;

    closeModal();
  }
  onMounted(() => {
    nextTick(() => {
      const dom = searchRef;
      useResizeObserver(dom, (entires) => {
        console.log(entires);

        scrollHeight.value =
          entires[0].target.parentElement?.clientHeight -
          entires[0].contentBoxSize![0].blockSize -
          40;
      });
    });
  });
  const sourceTypeList = ref([
    {
      label: SourceTypeNameEnum.wind,
      value: SourceTypeEnum.wind,
    },
    {
      label: SourceTypeNameEnum.bloomberg,
      value: SourceTypeEnum.bloomberg,
    },
    {
      label: SourceTypeNameEnum.reuter,
      value: SourceTypeEnum.reuter,
    },
    {
      label: SourceTypeNameEnum.mysteel,
      value: SourceTypeEnum.mysteel,
    },
    {
      label: SourceTypeNameEnum.cofeed,
      value: SourceTypeEnum.cofeed,
    },
    {
      label: SourceTypeNameEnum.formula,
      value: SourceTypeEnum.formula,
    },
    {
      label: SourceTypeNameEnum.website,
      value: SourceTypeEnum.website,
    },
    {
      label: SourceTypeNameEnum.eia,
      value: SourceTypeEnum.eia,
    },
    {
      label: SourceTypeNameEnum.usda,
      value: SourceTypeEnum.usda,
    },
    {
      label: SourceTypeNameEnum.manual,
      value: SourceTypeEnum.manual,
    },
    {
      label: SourceTypeEnum.other,
      value: SourceTypeEnum.other,
    },
  ]);
</script>

<style lang="less" scoped>
  .searchres-item {
    transition: background 0.2s ease;
  }

  .no-data {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
</style>
