<template>
  <BasicModal @register="registerModal" v-bind="$attrs" :loading="loading">
    <div class="grid grid-cols-3 grid-rows-2 w-full h-500px">
      <div class="col-span-1 row-span-1" ref="buyChart"></div>
      <div class="col-span-1 row-span-1" ref="saleChart"></div>
      <div class="col-span-1 row-span-1" ref="doneChart"></div>
      <div class="col-span-3 row-span-1" ref="lineChart"></div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { EChartsOption } from 'echarts';
  import { cloneDeep, mergeWith, reduce } from 'lodash-es';
  import { reactive, ref } from 'vue';
  import { getBuildShares, getHoldShares } from '@dq-next/http-apis/future';
  import { useModalInner, BasicModal } from '/@/components/Modal';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { toTimeStamp } from '@dq-next/utils/dateUtil';

  const { t } = useI18n();
  const { getColorScheme } = useRootSetting();

  interface chartData {
    title: string;
    data: { name: string; value: number }[];
  }

  const chartData = reactive<{ [key: string]: chartData }>({
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
  });
  const loading = ref(false);
  type dot = [number, number][];
  const lineData = reactive({
    title: t('monitor.futureRank.modal.linechartTtile'),
    bull: [] as dot,
    bear: [] as dot,
    calc: [] as dot,
  });
  const buyChart = ref();
  const saleChart = ref();
  const doneChart = ref();
  const lineChart = ref();

  const { setOptions: setBuyChartOptions } = useECharts(buyChart);
  const { setOptions: setSaleChartOptions } = useECharts(saleChart);
  const { setOptions: setDoneChartOptions } = useECharts(doneChart);
  const { setOptions: setLineChartOptions } = useECharts(lineChart);

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
  const [registerModal] = useModalInner(async (params) => {
    for (const key in chartData) {
      if (Object.prototype.hasOwnProperty.call(chartData, key)) {
        chartData[key].data = [];
      }
    }
    try {
      loading.value = true;
      const res = await getHoldShares(params);
      for (let i = 0; i < res.length; i++) {
        const data = res[i];
        switch (data.rankType) {
          case 1:
            chartData.buy.data.push({
              name: data.contract,
              value: data.volume,
            });
            break;
          case -1:
            chartData.sale.data.push({
              name: data.contract,
              value: data.volume,
            });
            break;
          default:
            break;
        }
      }
      lineData.bull = (
        await getBuildShares({
          memberName: params.memberName,
          productId: params.productId,
          rankType: 1,
        })
      ).map((item) => [toTimeStamp(item.tradeDate) * 1e3, item.volume]);
      lineData.bear = (
        await getBuildShares({
          memberName: params.memberName,
          productId: params.productId,
          rankType: -1,
        })
      ).map((item) => [toTimeStamp(item.tradeDate) * 1e3, item.volume]);
      const dateArray = [
        ...new Set(
          lineData.bull.map((item) => item[0]).concat(lineData.bear.map((item) => item[0])),
        ),
      ].sort();
      const offsetLine: dot = [];
      dateArray.forEach((date) => {
        const bullItem = lineData.bull.find((bull) => bull[0] === date) ?? [0, 0];
        const bearItem = lineData.bear.find((bear) => bear[0] === date) ?? [0, 0];
        offsetLine.push([date, bullItem[1] - bearItem[1]]);
      });
      const bullVolume = reduce(
        chartData.buy.data,
        (sum, v) => {
          sum = sum + v.value;
          return sum;
        },
        0,
      );
      const bearVolume = reduce(
        chartData.sale.data,
        (sum, v) => {
          sum = sum + v.value;
          return sum;
        },
        0,
      );
      setBuyChartOptions(
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
              data: chartData.buy.data,
            },
          ],
        }),
      );
      setSaleChartOptions(
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
              data: chartData.sale.data,
            },
          ],
        }),
      );
      setDoneChartOptions(
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
                  value: bullVolume,
                },
                {
                  name: t('monitor.futureRank.modal.bear'),
                  value: bearVolume,
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
              data: [...chartData.buy.data, ...chartData.sale.data],
            },
          ],
        }),
      );
      setLineChartOptions({
        title: {
          text: t('monitor.futureRank.modal.linechartTtile'),
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          position: (pt) => [pt[0], '10%'],
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
            },
          },
        },
        dataZoom: [
          {
            type: 'inside',
            start: 80,
            end: 100,
          },
          {
            start: 0,
            end: 20,
          },
        ],
        xAxis: {
          type: 'time',
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
        },
        legend: {
          top: '30',
          data: [
            t('monitor.futureRank.modal.bull'),
            t('monitor.futureRank.modal.bear'),
            t('monitor.futureRank.modal.calc'),
          ],
        },
        color: getColorScheme.value,
        series: [
          {
            name: t('monitor.futureRank.modal.bull'),
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: lineData.bull,
          },
          {
            name: t('monitor.futureRank.modal.bear'),
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: lineData.bear,
          },
          {
            name: t('monitor.futureRank.modal.calc'),
            type: 'line',
            smooth: true,
            symbol: 'none',
            areaStyle: {},
            data: offsetLine,
          },
        ],
      });
    } catch (error) {
    } finally {
      loading.value = false;
    }
  });
</script>

<style lang="less" scoped></style>
