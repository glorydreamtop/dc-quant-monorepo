<template>
  <div class="p-4 h-layout-full">
    <div class="h-full p-2 rounded-md shadow-md bg-white" v-loading="loadingRef">
      <div class="mx-4 pt-2 pb-4 border-b-1">
        <ARow class="w-full" :gutter="20">
          <ACol :span="4">
            <DatePicker
              valueFormat="YYYY-MM-DD"
              v-model:value="startDate"
              class="w-full"
              :allowClear="false"
              @change="getData"
            />
          </ACol>
          <div class="inline-block leading-loose">-</div>
          <ACol :span="4">
            <DatePicker
              valueFormat="YYYY-MM-DD"
              v-model:value="endDate"
              class="w-full"
              :allowClear="false"
              @change="getData"
            />
          </ACol>
          <ACol :span="4">
            <RadioGroup v-model:value="timeTypeRef" button-style="solid" @change="getData">
              <RadioButton :value="0">月周期</RadioButton>
              <RadioButton :value="1">季周期</RadioButton>
            </RadioGroup>
          </ACol>
        </ARow>
      </div>
      <div class="mx-4 flex" style="height: calc(100% - 70px)">
        <div class="flex-1 h-full pt-13">
          <div class="w-full h-full" ref="chartRefA"></div>
        </div>
        <div class="flex-1 h-full border-l-1 flex flex-col">
          <div class="flex-none pl-10 py-4">
            <RadioGroup v-model:value="chartTypeRef" @change="changeChartType">
              <Radio :value="item" :key="item" v-for="item in chartTypeOptions">{{ item }}</Radio>
            </RadioGroup>
          </div>
          <div class="flex-1" ref="chartRefB"> </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, Ref, onMounted } from 'vue';
  import { Radio, DatePicker, Row, Col } from 'ant-design-vue';
  import { getTableTimeSeries } from '@dq-next/http-apis/future';
  import { yearsAgo, formatToDate } from '@dq-next/utils/dateUtil';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { cloneDeep } from 'lodash-es';
  export default defineComponent({
    name: 'StockStyles',
    components: {
      [Col.name]: Col,
      [Row.name]: Row,
      DatePicker,
      Radio,
      RadioButton: Radio.Button,
      RadioGroup: Radio.Group,
    },
    setup() {
      const loadingRef = ref<boolean>(false);
      const startDate = ref(yearsAgo(1));
      const endDate = ref(formatToDate());
      const timeTypeRef = ref<number>(0);
      const chartTypeRef = ref<string>('金融');
      const chartTypeOptions: Ref<string[]> = ref(['金融', '周期']);
      const tableLeft = ['Q_ZX_RS_MTH', 'Q_ZX_RS_QTR'];
      const tableRight = ['Q_SW_RS_MTH', 'Q_SW_RS_QTR'];
      const chartConfig: any = {
        title: {
          text: `市场相对强弱`,
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow',
          },
          formatter: function (params) {
            return `${params.seriesName}<br/>X : ${params.data.value[0]}<br/>Y : ${
              params.data.value[1]
            }<br/>日期: ${params.data.value[2].split(' ')[0]}`;
          },
        },
        legend: {
          top: 'bottom',
          data: [],
        },
        xAxis: {
          name: 'x',
          minorTick: {
            show: true,
          },
          minorSplitLine: {
            show: true,
          },
        },
        yAxis: {
          name: 'y',
          minorTick: {
            show: true,
          },
          minorSplitLine: {
            show: true,
          },
        },
        markLine: {
          silent: true,
          data: {},
        },
        series: [],
      };
      const chartRefA = ref<HTMLDivElement | null>(null);
      const ChartA = useECharts(chartRefA as Ref<HTMLDivElement>);
      const chartRefB = ref<HTMLDivElement | null>(null);
      const ChartB = useECharts(chartRefB as Ref<HTMLDivElement>);
      let leftData = {};
      let rightData = {};
      initCharts();
      async function initCharts() {
        ChartA.setOptions(chartConfig);
        ChartB.setOptions(chartConfig);
        getData();
        onMounted(() => {
          ChartA.getInstance()?.on('click', 'series.line', function (e) {
            chartTypeRef.value = e.seriesName as string;
            changeRight(rightData[chartTypeRef.value]);
          });
        });
      }
      async function getData() {
        leftData = {};
        rightData = {};
        const params: any = {
          database: 'quants',
          dateColumn: 'TRADE_DT',
          end: endDate.value,
          start: startDate.value,
        };
        const leftRes = await getTableTimeSeries({
          ...params,
          tableName: tableLeft[timeTypeRef.value],
          valueColumn: 'ID,CODE,NAME,XSCORE,YSCORE',
        });
        const rightRes = await getTableTimeSeries({
          ...params,
          tableName: tableRight[timeTypeRef.value],
          valueColumn: 'ID,CODE,NAME,XSCORE,YSCORE,STYLE',
        });
        /********处理左图数据start ***********/
        if (leftRes.length) {
          changeLeft(leftRes);
        } else {
          ChartA.setOptions(chartConfig);
        }
        /********处理右图数据 end ***********/

        /********处理右图数据start ***********/
        if (leftRes.length) {
          rightRes.forEach((item) => {
            if (rightData[item.STYLE] == undefined) {
              rightData[item.STYLE] = [item];
            } else {
              rightData[item.STYLE].push(item);
            }
          });
          const rightOptions: string[] = [];
          for (let key in rightData) {
            rightOptions.push(key);
          }
          chartTypeOptions.value = rightOptions;
          chartTypeRef.value = rightOptions[0];
          changeRight(rightData[chartTypeRef.value]);
        } else {
          chartTypeOptions.value = [];
          chartTypeRef.value = '';
          ChartB.setOptions(chartConfig);
        }
        /********处理右图数据 end ***********/
      }
      function changeLeft(leftRes) {
        const AxisRange: number[] = getAxisRange(leftRes);
        leftRes.forEach((item) => {
          if (leftData[item.NAME] == undefined) {
            leftData[item.NAME] = [item];
          } else {
            leftData[item.NAME].push(item);
          }
        });
        const config = cloneDeep(chartConfig);
        const leftSeries: any[] = [];
        const leftNames: string[] = [];
        const avg = Math.min(AxisRange[0], AxisRange[1]);
        for (let key in leftData) {
          leftSeries.push({
            name: key,
            type: 'line',
            smooth: true,
            data: leftData[key].map((item, index) => {
              if (index == leftData[key].length - 1) {
                return {
                  value: [item.XSCORE, item.YSCORE, item.date],
                  symbol: 'circle',
                  symbolSize: 6,
                };
              } else {
                return {
                  value: [item.XSCORE, item.YSCORE, item.date],
                  symbol: 'circle',
                  symbolSize: 3,
                };
              }
            }),
            markLine:
              leftSeries.length == 0
                ? {
                    silent: true,
                    data: [
                      [
                        {
                          coord: [-avg, avg],
                          symbol: 'none',
                        },
                        {
                          coord: [avg, -avg],
                          symbol: 'none',
                        },
                      ],
                    ],
                  }
                : null,
          });
          leftNames.push(key);
        }
        config.series = leftSeries;
        config.legend.data = leftNames;
        config.xAxis.min = AxisRange[0] * -1;
        config.xAxis.max = AxisRange[0];
        config.yAxis.min = AxisRange[1] * -1;
        config.yAxis.max = AxisRange[1];
        ChartA.setOptions(config);
      }
      function changeRight(rightData) {
        const AxisRange: number[] = getAxisRange(rightData);
        const itemData = {};
        rightData.forEach((item) => {
          if (itemData[item.NAME] == undefined) {
            itemData[item.NAME] = [item];
          } else {
            itemData[item.NAME].push(item);
          }
        });
        const config = cloneDeep(chartConfig);
        const rightSeries: any[] = [];
        const rightNames: string[] = [];
        const avg = Math.min(AxisRange[0], AxisRange[1]);
        for (let key in itemData) {
          rightSeries.push({
            name: key,
            type: 'line',
            symbol: (value, params) => {
              if (params.dataIndex == itemData[key].length - 1) {
                return 'circle';
              } else {
                return 'none';
              }
            },
            symbolSize: 6,
            smooth: true,
            data: itemData[key].map((item, index) => {
              if (index == itemData[key].length - 1) {
                return {
                  value: [item.XSCORE, item.YSCORE, item.date],
                  symbol: 'circle',
                  symbolSize: 6,
                };
              } else {
                return {
                  value: [item.XSCORE, item.YSCORE, item.date],
                  symbol: 'circle',
                  symbolSize: 3,
                };
              }
            }),
            markLine:
              rightSeries.length == 0
                ? {
                    silent: true,
                    data: [
                      [
                        {
                          coord: [-avg, avg],
                          symbol: 'none',
                        },
                        {
                          coord: [avg, -avg],
                          symbol: 'none',
                        },
                      ],
                    ],
                  }
                : null,
          });
          rightNames.push(key);
        }
        config.series = rightSeries;
        config.legend.data = rightNames;
        config.title.text = `${chartTypeRef.value}相对强弱`;
        config.xAxis.min = AxisRange[0] * -1;
        config.xAxis.max = AxisRange[0];
        config.yAxis.min = AxisRange[1] * -1;
        config.yAxis.max = AxisRange[1];
        ChartB.setOptions(config);
      }
      function getAxisRange(data) {
        let x = 0;
        let y = 0;
        data.forEach((item) => {
          if (Math.abs(item.XSCORE) > x) {
            x = Math.abs(item.XSCORE);
          }
          if (Math.abs(item.YSCORE) > y) {
            y = Math.abs(item.YSCORE);
          }
        });
        x = Math.ceil(x * 10000) / 10000;
        y = Math.ceil(y * 10000) / 10000;
        return [x, y];
      }
      function changeChartType(e) {
        changeRight(rightData[e.target.value]);
      }
      return {
        loadingRef,
        startDate,
        endDate,
        timeTypeRef,
        chartTypeRef,
        chartTypeOptions,
        chartRefA,
        chartRefB,
        getData,
        changeChartType,
      };
    },
  });
</script>
