<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModalFuture"
    :width="1200"
    :showCancelBtn="false"
    @cancel="beforeClose"
    :showOkBtn="false"
    :minHeight="600"
    :loading="loadingRef"
  >
    <template #footer>
      <div>
        <a-button type="primary" @click="screenShot">保存为图片</a-button>
      </div>
    </template>
    <div v-show="chartShow" ref="chartContainer">
      <div class="h-300px flex">
        <div class="w-1/2" ref="chartRefA"></div>
        <div class="w-1/2" ref="chartRefB"></div>
      </div>
      <div class="w-full h-300px" ref="chartRefC"></div>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, Ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { getCommStructure } from '@dq-next/http-apis/future';
  import { formatToDate } from '@dq-next/utils/dateUtil';
  import { dom2imgFile, fileType } from '@dq-next/utils/domUtils';
  import { downloadByData } from '@dq-next/utils/file.js';
  export default defineComponent({
    components: { BasicModal },
    setup() {
      const chartShow = ref(false);
      const loadingRef = ref(false);
      const chartRefA = ref<HTMLDivElement | null>(null);
      const ChartA = useECharts(chartRefA as Ref<HTMLDivElement>);
      const chartRefB = ref<HTMLDivElement | null>(null);
      const ChartB = useECharts(chartRefB as Ref<HTMLDivElement>);
      const chartRefC = ref<HTMLDivElement | null>(null);
      const ChartC = useECharts(chartRefC as Ref<HTMLDivElement>);
      const chartContainer = ref<HTMLElement>();
      const observer = new ResizeObserver((_) => {
        ChartA.resize();
        ChartB.resize();
        ChartC.resize();
      });
      const [registerModalFuture, { closeModal }] = useModalInner(async (param) => {
        const el = unref(chartContainer)!;
        observer.observe(el);
        loadingRef.value = true;
        const res = await getCommStructure(param);
        boxplotChartInit(JSON.parse(res.box));
        structuralChartInit(JSON.parse(res.chg));
        seasonalChartInit(JSON.parse(res.seasonal));
        chartShow.value = true;
        loadingRef.value = false;
      });
      function boxplotChartInit(data) {
        const chartCofig = {
          title: {
            text: '价格结构分布',
            left: 'center',
          },
          tooltip: {
            trigger: 'item',
            axisPointer: {
              type: 'shadow',
            },
          },
          xAxis: [
            {
              type: 'category',
              data: [],
              splitLine: {
                show: false,
              },
            },
          ],
          yAxis: {
            type: 'value',
            splitArea: {
              show: true,
            },
            inverse: true,
            axisLabel: {
              formatter: (value) => {
                return `${value}%`;
              },
            },
          },
          color: ['#31868f', '#c23531'],
          series: [
            {
              type: 'boxplot',
              data: [],
            },
            {
              type: 'scatter',
              data: [],
              zlevel: 1,
            },
          ],
        };
        const names = ['现-近', '现-次', '现-远', '近-次', '近-远'];
        data.forEach((item, index) => {
          let boxplot = { name: names[index], value: [] };
          let scatter = [];
          boxplot.value = [item['min'], item['25%'], item['50%'], item['75%'], item['max']];
          scatter = [names[index], item['value']];
          chartCofig.series[0].data.push(boxplot);
          chartCofig.series[1].data.push(scatter);
          chartCofig.xAxis[0].data.push(names[index]);
        });
        ChartA.setOptions(chartCofig);
      }
      function structuralChartInit(data) {
        const chartCofig = {
          title: {
            text: '价格结构变化',
            left: 'center',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            data: [],
            left: 'center',
            top: 'bottom',
            type: 'plain',
          },
          xAxis: [
            {
              type: 'category',
              data: [],
              splitLine: {
                show: false,
              },
            },
          ],
          yAxis: {
            type: 'value',
            splitArea: {
              show: true,
            },
            inverse: true,
            axisLabel: {
              formatter: (value) => {
                return `${value}%`;
              },
            },
          },
          color: ['#c23531', '#2f4554', '#31868f', '#4FCBBF', '#5BDC61', '#5BB3DC', '#AD6EE4'],
          series: [],
        };
        const seriesNames = ['0D', '-1D', '-5D', '-20D'];
        const names = ['现-近', '现-次', '现-远', '近-次', '近-远'];
        for (let i = 0; i < seriesNames.length; i++) {
          let line = {
            name: seriesNames[i],
            data: [],
            smooth: false,
            type: 'line',
            label: { show: true },
          };
          let item = data[i];
          line.data = [item['p01'], item['p02'], item['p03'], item['p12'], item['p13']];
          chartCofig.series.push(line);
        }
        chartCofig.xAxis[0].data = names;
        chartCofig.legend.data = seriesNames;
        ChartB.setOptions(chartCofig);
      }
      function seasonalChartInit(data) {
        const chartCofig = {
          title: {
            text: '基差率季节性图',
            left: 'center',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              label: {
                formatter: ({ value }) => {
                  return `${formatToDate(value, 'MM-DD')}`;
                },
              },
            },
          },
          legend: {
            data: [],
            left: 'center',
            top: 'bottom',
            type: 'plain',
          },
          xAxis: [
            {
              type: 'time',
              splitLine: {
                show: false,
              },
              axisLabel: {
                formatter: '{MM}/{dd}',
              },
            },
          ],
          yAxis: {
            type: 'value',
            splitArea: {
              show: true,
            },
            axisLabel: {
              formatter: (value) => {
                return `${value}%`;
              },
            },
          },
          color: ['#c23531', '#2f4554', '#31868f', '#4FCBBF', '#5BDC61', '#5BB3DC', '#AD6EE4'],
          series: [],
        };
        const yearData = {};
        data.forEach((item) => {
          if (yearData[item.year] == undefined) {
            yearData[item.year] = [];
            yearData[item.year].push(item);
          } else {
            yearData[item.year].push(item);
          }
        });
        const names = [];
        let z = 0;
        for (let key in yearData) {
          let line = {
            name: String(key),
            data: [],
            smooth: false,
            type: 'line',
            symbol: 'none',
            z: z++,
          };
          names.unshift(String(key));
          yearData[key].sort((a, b) => a.dt - b.dt);
          for (let i = 0; i < yearData[key].length; i++) {
            let date = new Date(yearData[key][i].dt);
            const curYear = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            if (curYear == Number(key)) {
              line.data.push([`2020/${month}/${day}`, yearData[key][i].ba_r]);
            } else {
              line.data.push([`2021/${month}/${day}`, yearData[key][i].ba_r]);
            }
          }
          chartCofig.series.unshift(line);
        }
        chartCofig.legend.data = names;
        ChartC.setOptions(chartCofig);
      }
      function beforeClose() {
        chartShow.value = false;
        observer.unobserve(unref(chartContainer)!);
        closeModal();
      }
      async function screenShot() {
        loadingRef.value = true;
        const screenshotBlob = await dom2imgFile({
          dom: unref(chartContainer)!,
          type: fileType.BLOB,
        });
        downloadByData(screenshotBlob as Blob, `品种明细.jpeg`);
        loadingRef.value = false;
      }
      return {
        beforeClose,
        chartShow,
        loadingRef,
        registerModalFuture,
        chartRefA,
        chartRefB,
        chartRefC,
        chartContainer,
        screenShot,
      };
    },
  });
</script>
