<template>
  <div class="h-layout-full flex flex-col gap-4 p-4 w-full">
    <div class="flex items-center h-1/2 min-h-400px gap-4">
      <div class="w-60 h-full bg-white p-4 flex flex-col gap-2 overflow-y-scroll no-scroll-bar">
        <RadioGroup size="small" v-model:value="searchParams.type" button-style="solid">
          <RadioButton value="contract">{{ t('monitor.futureRank.contract') }}</RadioButton>
          <RadioButton value="productId">{{ t('monitor.futureRank.productName') }}</RadioButton>
        </RadioGroup>
        <Select
          v-model:value="searchParams.key"
          show-search
          :default-active-first-option="false"
          :options="searchParams.searchResult"
          @search="handleSearch"
          @select="handleSelect($event, false)"
          :placeholder="t('monitor.futureRank.serachPlaceholder')"
        >
          <template v-if="state.loadingData" #notFoundContent>
            <Icon class="loading" icon="ant-design:loading-outlined" />
          </template>
        </Select>
        <div class="h-8 pl-2 text-primary">{{
          rankParams.tradeDate || t('monitor.futureRank.timePlaceholder')
        }}</div>
        <div
          ref="calendar"
          class="-mt-2 relative"
          v-loading="state.loadingDate"
          :loading-tip="t('monitor.getAvailableDate')"
        ></div>
        <DatePicker
          :getPopupContainer="getCalendarContainer"
          valueFormat="YYYY-MM-DD"
          :disabled-date="disabledDate"
          size="small"
          :show-today="false"
          v-model:value="rankParams.tradeDate"
          open
          class="calendar-input"
          @change="handleSelect($event, true)"
        >
          <template #dateRender="{ current }">
            <div
              :class="[
                'picker-date',
                avalidDate.includes(current.format('YYYY-MM-DD')) ? 'avalid-date' : 'disabled',
                current.format('YYYY-MM-DD') === rankParams.tradeDate ? 'selected-date' : '',
              ]"
            >
              {{ current.date() }}
            </div>
          </template>
        </DatePicker>
      </div>
      <div class="flex justify-start gap-4 flex-grow h-full children:h-full children:flex-grow">
        <TopList :data-list="rankList.done" @openDetail="openDetail">
          <div class="flex text-center h-10 items-center sticky top-0 bg-white shadow-md">
            <div class="w-20">{{ t('monitor.futureRank.rankIndex') }}</div>
            <div class="flex flex-grow divide-x divide-gray-200">
              <div class="w-1/3">{{ t('monitor.futureRank.memberName') }}</div>
              <div class="w-1/3">{{ t('monitor.futureRank.openDone') }}</div>
              <div class="w-1/3">{{ t('monitor.futureRank.change') }}</div>
            </div>
          </div>
        </TopList>
        <TopList :data-list="rankList.buy" @openDetail="openDetail">
          <div class="flex text-center h-10 items-center sticky top-0 bg-white shadow-md">
            <div class="w-20">{{ t('monitor.futureRank.rankIndex') }}</div>
            <div class="flex flex-grow divide-x divide-gray-200">
              <div class="w-1/3">{{ t('monitor.futureRank.memberName') }}</div>
              <div class="w-1/3">{{ t('monitor.futureRank.openBuy') }}</div>
              <div class="w-1/3">{{ t('monitor.futureRank.change') }}</div>
            </div>
          </div>
        </TopList>
        <TopList :data-list="rankList.sale" @openDetail="openDetail">
          <div class="flex text-center h-10 items-center sticky top-0 bg-white shadow-md">
            <div class="w-20">{{ t('monitor.futureRank.rankIndex') }}</div>
            <div class="flex flex-grow divide-x divide-gray-200">
              <div class="w-1/3">{{ t('monitor.futureRank.memberName') }}</div>
              <div class="w-1/3">{{ t('monitor.futureRank.openSale') }}</div>
              <div class="w-1/3">{{ t('monitor.futureRank.change') }}</div>
            </div>
          </div>
        </TopList>
      </div>
    </div>
    <div class="flex-grow bg-white flex items-center justify-between p-4 w-full">
      <RankChart class="w-1/2" :data-list="rankList.buy" :title="chartTitle.buy" :size="10" />
      <RankChart class="w-1/2" :data-list="rankList.sale" :title="chartTitle.sale" :size="10" />
    </div>
    <DetailModal @register="registerModal" />
  </div>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, reactive, ref } from 'vue';
  import TopList from './components/TopList.vue';
  import RankChart from './components/RankChart.vue';
  import { RankResult } from '@dq-next/http-apis/future/model';
  import {
    getFutureRankList,
    getProOrConValidDate,
    getSearchInfoList,
  } from '@dq-next/http-apis/future';
  import { openInterestEnum } from '/@/enums/monitorEnum';
  import { formatToDate } from '@dq-next/utils/dateUtil';
  import { Radio, Select, DatePicker } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDebounceFn } from '@vueuse/shared';
  import { cloneDeep, last } from 'lodash-es';
  import { useModal } from '/@/components/Modal';
  import DetailModal from './components/DetailModal.vue';

  const RadioGroup = Radio.Group;
  const RadioButton = Radio.Button;

  const { t } = useI18n();

  const state = reactive({
    loadingDate: false,
    loadingData: false,
  });

  const rankList = reactive({
    done: [] as RankResult,
    buy: [] as RankResult,
    sale: [] as RankResult,
  });
  // 查询排名列表所需参数
  const rankParams = reactive({
    tradeDate: '',
    contract: '',
    productId: '',
  });
  const chartTitle = reactive({
    buy: `${t('monitor.futureRank.openBuy')}Top10`,
    sale: `${t('monitor.futureRank.openSale')}Top10`,
  });
  async function getRankList() {
    const params = cloneDeep(rankParams);
    // 去掉空参数
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key) && params[key] === '') {
        Reflect.deleteProperty(params, key);
      }
    }
    rankList.done = await getFutureRankList({ ...params, rankType: openInterestEnum.Done });
    rankList.buy = await getFutureRankList({ ...params, rankType: openInterestEnum.Buy });
    rankList.sale = await getFutureRankList({ ...params, rankType: openInterestEnum.Done });
  }
  const searchParams = reactive({
    type: 'productId',
    key: '',
    typeList: ['productId', 'contract'],
    searchResult: [] as LabelValueOptions,
  });
  async function search(key: string) {
    searchParams.key = key;
    state.loadingData = true;
    try {
      // 搜索列表构建
      searchParams.searchResult = (
        await getSearchInfoList({
          type: searchParams.typeList.indexOf(searchParams.type),
          key,
        })
      ).map((item) => {
        if (typeof item === 'string') {
          return { value: item, label: item, key: item };
        } else {
          return { value: item.productName, label: item.productName, key: item.productId };
        }
      });
    } catch (error) {
    } finally {
      state.loadingData = true;
    }
  }
  const handleSearch = useDebounceFn(search, 1000);
  async function handleSelect(value: string, datePicker = false) {
    if (!datePicker) {
      rankParams.productId = '';
      rankParams.contract = '';
      rankParams[searchParams.type] = searchParams.searchResult.find(
        (item) => item.value === value,
      )!.key;
      await updateValidDate();
      rankParams.tradeDate === '' && (rankParams.tradeDate = formatToDate(last(avalidDate.value)!));
    }
    const name = searchParams.key;
    chartTitle.buy = `${rankParams.tradeDate} ${name} ${t('monitor.futureRank.openBuy')}Top10`;
    chartTitle.sale = `${rankParams.tradeDate} ${name} ${t('monitor.futureRank.openSale')}Top10`;
    await getRankList();
  }
  const calendar = ref<HTMLDivElement>();

  function getCalendarContainer() {
    return calendar.value!;
  }
  // 不可用日期
  function disabledDate(cur: any): boolean {
    const date = cur.format('YYYY-MM-DD');
    return !avalidDate.value.includes(date);
  }
  const avalidDate = ref(['']);
  async function updateValidDate() {
    state.loadingDate = true;
    avalidDate.value = (
      await getProOrConValidDate({
        [searchParams.type]: rankParams[searchParams.type],
      })
    ).map((day) => formatToDate(day));
    state.loadingDate = false;
  }
  const [registerModal, { openModal, setModalProps }] = useModal();
  function openDetail(memberName: string, productId: string) {
    setModalProps({
      title: `${memberName}-${searchParams.key} ${rankParams.tradeDate} ${t(
        'monitor.futureRank.openInterestDetail',
      )}`,
      width: 1200,
      height: 500,
      minHeight: 500,
      footer: null,
    });
    openModal(true, {
      memberName,
      tradeDate: rankParams.tradeDate,
      productId,
    });
  }
  onMounted(async () => {
    await nextTick();
    const height = calendar.value?.getElementsByClassName(
      'ant-calendar-picker-container-content',
    )[0]!.clientHeight;
    calendar.value!.style.height = `${height}px`;
  });
</script>

<style lang="less" scoped>
  .calendar-input {
    display: none;
  }

  ::v-deep(.ant-picker-panel-container) {
    width: 100%;
    box-shadow: none;
    border: 1px solid #e0e0e0;
  }

  ::v-deep(.ant-picker-dropdown) {
    z-index: unset;
  }

  ::v-deep(.ant-calendar-disabled-cell) {
    cursor: not-allowed;
  }

  ::v-deep(.ant-picker-date-panel) {
    width: 206px;

    .ant-picker-content {
      width: 180px;

      th {
        width: 20px;
        min-width: 20px;
      }
    }
  }

  .picker-date {
    // width: 20px;
    // margin-right: 0;
  }

  .avalid-date {
    @apply text-gray-700;

    transition: all 0.2s;
    cursor: pointer;
    text-align: center;
  }

  .disabled {
    background-color: #eee;
    color: #b0b0b0;
    text-align: center;
  }

  .selected-date {
    border-radius: 4px;
    border: rgba(@primary-color, 0.5) solid 1px;
    background-color: rgba(@primary-color, 0.25);
    color: @primary-color;
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
