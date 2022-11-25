<template>
  <div class="flex justify-start items-center h-layout-full p-4 gap-4 w-full overflow-hidden">
    <div class="h-full min-w-75 w-75 relative border" v-resizeable:show="`x`">
      <QuotaTree :show-search="true" class="h-full w-full enter-y" @selectNode="selectNode" />
    </div>
    <div class="flex flex-col h-full max-h-full flex-grow gap-4">
      <QuotaList class="border enter-y w-full quota-list" v-resizeable:show="`y`" />
      <ChartGenerator class="enter-y" />
    </div>
  </div>
</template>

<script lang="ts" setup name="quotaView">
  import { QuotaTree } from '/@/components/QuotaTree';
  import QuotaList from './components/QuotaList.vue';
  import ChartGenerator from './components/ChartGenerator.vue';
  import { reactive, ref } from 'vue';
  import {
    createChartConfigContext,
    createChartOriginDataContext,
    createQuotaListContext,
    createSelectedQuotaListContext,
  } from './components/hooks';
  import type { QuotaItem } from '/#/quota';
  import type { SelectedQuotaItem } from './components/hooks';
  import { getChartDefaultConfig } from './helper';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { chartTypeEnum } from '/@/enums/chartEnum';
  import { getQuotaDataResult } from '@dq-next/http-apis/quota/model';
  // import { TemplateItem } from '/#/template';

  const { createMessage } = useMessage();
  const { t } = useI18n();

  // 交付给绘图的指标列表
  const quotaList = ref<QuotaItem[]>([]);
  createQuotaListContext(quotaList);
  // 所有从树中选中的指标
  const selectedQuotaList = ref<SelectedQuotaItem[]>([]);
  createSelectedQuotaListContext(selectedQuotaList);
  // 一份图表的配置信息
  const chartConfig = reactive(getChartDefaultConfig(chartTypeEnum.normal));
  createChartConfigContext(chartConfig);
  // 指标数据的Api源数据
  const originData = ref<getQuotaDataResult[]>([]);
  createChartOriginDataContext(originData);

  function selectNode(q: QuotaItem) {
    const sq = cloneDeep(q) as SelectedQuotaItem;
    if (selectedQuotaList.value.find((q) => q.id === sq.id)) {
      createMessage.warn((q.shortName || q.name) + t('quotaView.uniqSelectedQuotaMessage'));
      return;
    }
    sq.selected = true;
    selectedQuotaList.value.push(sq);
  }
  // function selectTemplateNode(template:TemplateItem){

  // }
</script>
<style lang="less" scoped></style>
