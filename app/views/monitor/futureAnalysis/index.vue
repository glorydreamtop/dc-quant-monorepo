<template>
  <div class="h-layout-full p-4 flex flex-col gap-4">
    <div
      class="w-full p-4 bg-white flex gap-4 justify-start items-center"
      v-loading="!state.allowQueryDate"
    >
      <span>
        <span class="label">{{ t('monitor.futureAnalysis.futuresDealer') }}</span>
        <Select class="w-32" :options="params.memberList" v-model:value="params.memberName" />
      </span>
      <span>
        <span class="label">{{ t('monitor.futureAnalysis.exchange') }}</span>
        <Select class="w-32" :options="params.exchangeList" v-model:value="params.exchange" />
      </span>
      <span>
        <span class="label">{{ t('monitor.futureAnalysis.exchangeDate') }}</span>
        <DatePicker
          class="w-36"
          :disabled-date="disabledDate"
          value-format="YYYY-MM-DD"
          v-model:value="params.tradeDate"
        />
      </span>
      <Button type="primary" @click="getDetails" :disabled="!state.allowQuery">
        <template #icon>
          <Icon icon="ant-design:search-outlined" />
        </template>
        <span>{{ t('common.queryText') }}</span>
      </Button>
      <div
        v-show="!state.allowQuery && state.allowQueryDate"
        :class="[
          'italic text-gray-400',
          !state.allowQuery
            ? 'animate__animated animate__slow animate__flash animate__infinite'
            : '',
        ]"
        >{{ t('monitor.getAvailableDate') }}</div
      >
    </div>
    <div class="w-full bg-white flex-grow" id="future-analysis" v-loading="state.loading">
      <Tabs :tabBarStyle="{ textAlign: 'center' }" v-model:activeKey="activeKey">
        <TabPane class="flex" key="share" :tab="t('monitor.futureAnalysis.share')" forceRender>
          <div class="w-1/3 future-analysis-chart" :ref="chartRef.share.buy"></div>
          <div class="w-1/3 future-analysis-chart" :ref="chartRef.share.sale"></div>
          <div class="w-1/3 future-analysis-chart" :ref="chartRef.share.done"></div>
        </TabPane>
        <TabPane class="flex" key="money" :tab="t('monitor.futureAnalysis.money')" forceRender>
          <div class="w-1/3 future-analysis-chart" :ref="chartRef.money.buy"></div>
          <div class="w-1/3 future-analysis-chart" :ref="chartRef.money.sale"></div>
          <div class="w-1/3 future-analysis-chart" :ref="chartRef.money.done"></div>
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, Ref, ref, watch } from 'vue';
  import { Select, DatePicker, Button, Tabs } from 'ant-design-vue';
  import {
    getExchangeList,
    getHoldSharesAnalyse,
    getMemberHoldSharesWorth,
    getMemberValidDate,
    getSearchMemberList,
  } from '@dq-next/http-apis/future';
  import { cloneDeep, mergeWith, pick, reduce } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { RankResult } from '@dq-next/http-apis/future/model';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { EChartsOption } from 'echarts';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { domForeach } from '@dq-next/utils/domUtils';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { t } = useI18n();
  const TabPane = Tabs.TabPane;
  const { getColorScheme } = useRootSetting();
  const { createMessage } = useMessage();

  interface Params {
    memberList: LabelValueOptions;
    exchangeList: LabelValueOptions;
    memberName: string;
    exchange: string;
    tradeDate: string;
    availableDate: string[];
  }
  const params = reactive<Params>({
    memberList: [],
    exchangeList: [],
    memberName: '',
    exchange: '',
    tradeDate: '',
    availableDate: [],
  });
  const state = reactive({
    loading: false,
    allowQuery: false,
    allowQueryDate: true,
  });
  async function init() {
    state.allowQueryDate = false;
    try {
      params.memberList = (await getSearchMemberList()).map((name) => ({
        label: name,
        value: name,
      }));
      const exchange = await getExchangeList();
      params.exchangeList = Object.keys(exchange).map((key) => ({
        label: exchange[key],
        value: key,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      state.allowQueryDate = true;
    }
  }

  async function getAvailableDate() {
    state.allowQuery = false;
    try {
      params.availableDate = await getMemberValidDate(pick(params, ['memberName', 'exchange']));
      state.allowQuery = true;
    } catch (error) {
      createMessage.error(t('monitor.getAvailableDateError'));
    }
  }

  // 不可用日期
  function disabledDate(cur: any): boolean {
    const date = `${cur.format('YYYY-MM-DD')} 00:00:00`;
    return !params.availableDate.includes(date);
  }

  watch(
    () => [params.exchange, params.memberName],
    () => {
      getAvailableDate();
    },
  );

  function getSum(arr: Array<any>) {
    return reduce(
      arr,
      (sum, v) => {
        sum = sum + v.value;
        return sum;
      },
      0,
    );
  }

  async function getDetails() {
    state.loading = true;
    const options = {
      memberName: params.memberName,
      exchange: params.exchange,
      tradeDate: `${params.tradeDate} 00:00:00`,
    };
    try {
      const share = await getHoldSharesAnalyse(options);
      const shareData = makeData(share);
      const shareBullVolume = getSum(shareData.buy.data);
      const shartBearVolume = getSum(shareData.sale.data);
      chartFn.share.buy.setOptions(
        // @ts-ignore
        makePieChartOptions({
          title: {
            text: t('monitor.futureRank.modal.buychartTtile'),
          },
          series: [
            {
              name: t('monitor.futureRank.modal.buychartTtile'),
              type: 'pie',
              radius: '60%',
              data: shareData.buy.data,
            },
          ],
        }),
      );
      chartFn.share.sale.setOptions(
        // @ts-ignore
        makePieChartOptions({
          title: {
            text: t('monitor.futureRank.modal.salechartTtile'),
          },
          series: [
            {
              name: t('monitor.futureRank.modal.salechartTtile'),
              type: 'pie',
              radius: '60%',
              data: shareData.sale.data,
            },
          ],
        }),
      );
      chartFn.share.done.setOptions(
        // @ts-ignore
        makePieChartOptions({
          title: {
            text: t('monitor.futureRank.modal.donechartTtile'),
          },
          series: [
            {
              type: 'pie',
              selectedMode: 'single',
              radius: [0, '35%'],
              label: {
                position: 'inner',
                fontSize: 14,
              },
              labelLine: {
                show: false,
              },
              data: [
                {
                  name: t('monitor.futureRank.modal.bull'),
                  value: shareBullVolume,
                },
                {
                  name: t('monitor.futureRank.modal.bear'),
                  value: shartBearVolume,
                },
              ],
            },
            {
              type: 'pie',
              label: {
                formatter: ({ name, percent }) => {
                  return `${name}\n${percent}%`;
                },
              },
              selectedMode: 'single',
              radius: ['40%', '60%'],
              data: [...shareData.buy.data, ...shareData.sale.data],
            },
          ],
        }),
      );
      const money = await getMemberHoldSharesWorth(options);
      const moneyData = makeData(money);
      const moneyBullVolume = getSum(moneyData.buy.data);
      const moneyBearVolume = getSum(moneyData.sale.data);
      chartFn.money.buy.setOptions(
        // @ts-ignore
        makePieChartOptions({
          title: {
            text: t('monitor.futureRank.modal.buychartTtile'),
          },
          series: [
            {
              name: t('monitor.futureRank.modal.buychartTtile'),
              type: 'pie',
              radius: '60%',
              data: moneyData.buy.data,
            },
          ],
        }),
      );
      chartFn.money.sale.setOptions(
        // @ts-ignore
        makePieChartOptions({
          title: {
            text: t('monitor.futureRank.modal.salechartTtile'),
          },
          series: [
            {
              name: t('monitor.futureRank.modal.salechartTtile'),
              type: 'pie',
              radius: '60%',
              data: moneyData.sale.data,
            },
          ],
        }),
      );
      chartFn.money.done.setOptions(
        // @ts-ignore
        makePieChartOptions({
          title: {
            text: t('monitor.futureRank.modal.donechartTtile'),
          },
          series: [
            {
              type: 'pie',
              selectedMode: 'single',
              radius: [0, '35%'],
              label: {
                position: 'inner',
                fontSize: 14,
              },
              labelLine: {
                show: false,
              },
              data: [
                {
                  name: t('monitor.futureRank.modal.bull'),
                  value: moneyBullVolume,
                },
                {
                  name: t('monitor.futureRank.modal.bear'),
                  value: moneyBearVolume,
                },
              ],
            },
            {
              type: 'pie',
              label: {
                formatter: ({ name, percent }) => {
                  return `${name}\n${percent}%`;
                },
              },
              selectedMode: 'single',
              radius: ['40%', '60%'],
              data: [...moneyData.buy.data, ...moneyData.sale.data],
            },
          ],
        }),
      );
    } catch (error) {
      createMessage.error(error);
    } finally {
      state.loading = false;
    }
  }
  function makeData(res: RankResult) {
    const chartData: { [key: string]: chartData } = {
      buy: {
        title: t('monitor.futureRank.modal.buychartTtile'),
        data: [],
      },
      sale: {
        title: t('monitor.futureRank.modal.salechartTtile'),
        data: [],
      },
      done: {
        title: t('monitor.futureRank.modal.donechartTtile'),
        data: [],
      },
    };
    for (let i = 0; i < res.length; i++) {
      const data = res[i];
      switch (data.rankType) {
        case 1:
          chartData.buy.data.push({
            name: data.productId,
            value: data.volume,
          });
          break;
        case -1:
          chartData.sale.data.push({
            name: data.productId,
            value: data.volume,
          });
          break;
        default:
          break;
      }
    }
    return chartData;
  }
  const activeKey = ref<'share' | 'money'>('share');
  const chartRef = {
    share: {
      buy: ref<Element>(),
      sale: ref<Element>(),
      done: ref<Element>(),
    },
    money: {
      buy: ref<Element>(),
      sale: ref<Element>(),
      done: ref<Element>(),
    },
  };
  const chartFn = {
    share: {
      buy: useECharts(chartRef.share.buy as Ref<HTMLDivElement>),
      sale: useECharts(chartRef.share.sale as Ref<HTMLDivElement>),
      done: useECharts(chartRef.share.done as Ref<HTMLDivElement>),
    },
    money: {
      buy: useECharts(chartRef.money.buy as Ref<HTMLDivElement>),
      sale: useECharts(chartRef.money.sale as Ref<HTMLDivElement>),
      done: useECharts(chartRef.money.done as Ref<HTMLDivElement>),
    },
  };

  interface chartData {
    title: string;
    data: { name: string; value: number }[];
  }

  function makePieChartOptions(options: EChartsOption) {
    const base = {
      title: {
        text: '',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c} ({d}%)',
      },
      legend: {
        top: 'bottom',
      },
      label: {
        formatter: ({ name, percent }) => {
          return `${name}\n${percent}%`;
        },
      },
      color: getColorScheme.value,
      series: [
        {
          name: '',
          type: 'pie',
          radius: '60%',
          data: [],
        },
      ],
    };
    mergeWith(base, cloneDeep(options), (target, src) => {
      if (target instanceof Array) {
        return reactive(src);
      }
    });
    return base;
  }

  onMounted(async () => {
    const height = `${document.getElementById('future-analysis')!.clientHeight - 50}px`;
    domForeach(document.getElementsByClassName('future-future-analysis-chart'), (dom) => {
      (dom as HTMLElement).style.height = height;
    });
    await init();
    params.memberName = params.memberList[0].value;
    params.exchange = params.exchangeList[0].value;
  });
</script>

<style lang="less" scoped>
  .label {
    @apply mr-1;

    &::after {
      content: ':';
    }
  }

  .future-analysis-chart {
    height: 500px;
  }
</style>
