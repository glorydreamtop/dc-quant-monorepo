<template>
  <div class="p-4 h-layout-full">
    <div class="h-full p-2 rounded-md shadow-md bg-white" v-loading="loadingRef">
      <div class="mx-4 pt-2 pb-4 border-b-1">
        <ARow class="w-full" :gutter="20">
          <ACol :span="4">
            <TreeSelect
              v-model:value="productId"
              :tree-data="productOptions"
              :replaceFields="{ value: 'id', label: 'name' }"
              :allowClear="true"
              placeholder="请选择品种"
              class="w-full"
              @change="handleChangeProduct"
            />
          </ACol>
          <ACol :span="4">
            <RangePicker
              valueFormat="YYYY-MM-DD"
              v-model:value="tradeDate"
              class="w-full"
              :allowClear="false"
              @change="handleChangeTime"
            />
          </ACol>
          <ACol :span="4">
            <Checkbox
              v-model:checked="checkYear"
              @change="handleCheckYearChange"
              style="line-height: 32px"
            >
              按年展示
            </Checkbox>
          </ACol>
          <ACol :offset="8" :span="4">
            <a-button
              type="danger"
              preIcon="fluent:delete-20-regular"
              class="float-right"
              @click="clearAll"
            >
              清空图表
            </a-button>
          </ACol>
        </ARow>
      </div>
      <div class="mx-4 flex" style="height: calc(100% - 70px)">
        <div class="flex-1 h-full py-4 overflow-hidden">
          <div class="w-full h-full" ref="chartRef" v-show="checkYear == false"></div>
          <div class="w-full h-full overflow-scroll" v-show="checkYear == true">
            <div
              class="w-full h-300px"
              :ref="setChartRefs"
              :data-year="item.year"
              :key="item.year"
              v-for="item in yearOptions"
            ></div>
          </div>
        </div>
        <div class="flex-none flex-col h-full border-l-1">
          <div class="w-300px h-full flex flex-col">
            <div class="pt-3 pb-1 pl-2 border-b-1 w-full flex-none">
              <div
                class="tag-box mb-2"
                v-for="item in tagOpt"
                :key="item.value"
                :class="{ cur: isTagCur(item.value) }"
                @click="handleClickTag(item.value)"
                @contextmenu="handleTagContext($event, item)"
                >{{ item.label }}</div
              >
              <EditOutlined
                class="cursor-pointer hover:text-primary"
                :style="{ fontSize: '18px', verticalAlign: 'text-bottom' }"
                @click="OpenTagManage"
              />
            </div>

            <div class="w-full flex-1 pl-2 overflow-auto">
              <div
                v-for="item in indexOpt"
                :key="item.id"
                @click="handleClickIndex(item.id)"
                @contextmenu="handleIndexContext($event, item)"
                class="index-box"
                :class="{ cur: isIndexCur(item.id) }"
                >{{ item.name }}<div :class="hasSet(item.id)"></div
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 标签管理弹窗 -->
    <ModalTagManage @register="registerTagManage" @on-tags-edit="emitTagsSet" />
    <!-- 图表设置弹窗 -->
    <ModalChartSet
      @register="registerChartSet"
      @on-chart-set="emitChartSet"
      @on-config-reset="emitConfigReset"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, Ref, nextTick, onBeforeUpdate } from 'vue';
  import { DatePicker, Row, Col, Checkbox, TreeSelect } from 'ant-design-vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { useContextMenu } from '/@/hooks/web/useContextMenu';
  import { EditOutlined } from '@ant-design/icons-vue';
  import { getAllTemplate } from '@dq-next/http-apis/report';
  import { getIndexByProduct } from '@dq-next/http-apis/future';
  import { getQuotaData, quotaDataExportTypeEnum } from '@dq-next/http-apis/quota';
  import { cloneDeep } from 'lodash-es';
  import ModalTagManage from './components/ModalTagManage.vue';
  import ModalChartSet from './components/ModalChartSet.vue';
  import { yearsAgo, formatToDate, getYear } from '@dq-next/utils/dateUtil';
  import {
    tagContextModel,
    chartSetConfigModel,
    indexOptModel,
    paramLineModel,
    yearOptionsModel,
  } from './model';

  export default defineComponent({
    name: 'MultiMonitor',
    components: {
      ModalTagManage,
      ModalChartSet,
      [Col.name]: Col,
      [Row.name]: Row,
      RangePicker: DatePicker.RangePicker,
      TreeSelect,
      Checkbox,
      EditOutlined,
    },
    setup() {
      const loadingRef = ref<boolean>(false);
      const { createConfirm } = useMessage();
      const productId = ref(undefined);
      const productOptions = ref([]);
      const tradeDate: Ref<string[]> = ref([yearsAgo(5), formatToDate()]);
      const checkYear = ref<boolean>(false);
      getCategoryListFunc();
      // 获得品种列表
      async function getCategoryListFunc() {
        const res = await getAllTemplate({ type: 'product' });
        const treeData = setTreeDisabled(res);
        productOptions.value = treeData;
      }
      function setTreeDisabled(res) {
        for (let i in res) {
          if (res[i].children) {
            res[i]['selectable'] = false;
            setTreeDisabled(res[i].children);
          }
        }
        return res;
      }
      function handleCheckYearChange() {
        redrawYearCharts(checkYear.value);
      }
      /*********标签模块start***********/
      const [registerTagManage, { openModal }] = useModal();
      const tagOpt = ref([
        { label: '现货', value: '现货' },
        { label: '库存', value: '库存' },
        { label: '利润', value: '利润' },
      ]);
      const curTag: Ref<string> = ref('现货');
      const isTagCur = (value) => {
        if (curTag.value !== value) {
          return false;
        } else {
          return true;
        }
      };
      const handleClickTag = async (value) => {
        if (curTag.value == value) {
          return;
        } else {
          curTag.value = value;
        }
        let info = await getIndexByProduct({
          productId: productId.value,
          tagName: curTag.value,
        });
        if (!Array.isArray(info)) {
          info = [];
        }
        indexOpt.value = info;
      };
      const OpenTagManage = () => {
        openModal(true);
      };
      const emitTagsSet = (tags) => {
        tagOpt.value = tags;
      };
      /*********标签模块end***********/

      /*********标签设置start***********/
      const [registerChartSet, { openModal: openChartSetModal, setModalProps }] = useModal();
      const [createContextMenu] = useContextMenu();
      const TagConfig = {}; //标签配置
      const IndexConfig = {}; //指标配置
      function handleTagContext(e: MouseEvent, item: tagContextModel) {
        createContextMenu({
          event: e,
          items: [
            {
              label: 'Y轴设置',
              icon: 'mdi:cog-outline',
              handler: () => {
                console.log(e);
                setModalProps({
                  title: `Y轴设置(${item.label})`,
                });
                openChartSetModal(true, {
                  obj: { ...item, setStatus: false },
                  index: TagConfig[item.value] ?? 0,
                  type: 'tag',
                });
              },
            },
          ],
        });
      }
      function emitChartSet(values, curObj) {
        let config: chartSetConfigModel = {
          id: values.index,
          min: values.min,
          max: values.max,
          inverse: values.inverse,
          axisLabel: {
            formatter: values.showPercent
              ? (value) => {
                  return `${(value * 100).toFixed(2)}%`;
                }
              : null,
          },
        };
        chartOption.yAxis.forEach((item) => {
          if (item.id == config.id) {
            Object.assign(item, config);
          }
        });
        if (curObj.type == 'tag') {
          TagConfig[curObj.obj.value] = values.index;
          chartOption.series.forEach((item) => {
            if (item.configType == 'tag' && item.configValue == curObj.obj.value) {
              item.yAxisIndex = values.index;
            }
          });
        } else {
          IndexConfig[curObj.obj.id] = values.index;
          chartOption.series.forEach((item) => {
            if (item.id == curObj.obj.id) {
              item.yAxisIndex = values.index;
              item.configType = 'index';
              item.configValue = item.id;
            }
          });
        }
        checkYaxisShow();
        Chart.setOptions(chartOption, false);
        setTimeout(() => {
          transformEachYearChart();
        }, 500);
      }
      function emitConfigReset(curObj) {
        delete IndexConfig[curObj.obj.id];
        const index = TagConfig[curTag.value] ?? 0;
        chartOption.series.forEach((item) => {
          if (item.id == curObj.obj.id) {
            item.yAxisIndex = index;
          }
        });
        checkYaxisShow();
        initLineCharts(false);
      }
      /*********标签设置 end***********/

      /*********指标模块start***********/
      const indexOpt: Ref<indexOptModel[]> = ref([]);
      const curIndexList: Ref<number[]> = ref([]);
      const isIndexCur = (value) => {
        if (curIndexList.value.indexOf(value) == -1) {
          return false;
        } else {
          return true;
        }
      };
      const hasSet = (id) => {
        if (IndexConfig[id] == undefined) {
          return {
            triangle: false,
          };
        } else {
          return {
            triangle: true,
          };
        }
      };
      const handleClickIndex = (value) => {
        const index = curIndexList.value.indexOf(value);
        if (index == -1) {
          curIndexList.value.push(value);
          addLine(indexOpt.value.find((item) => item.id == value));
        } else {
          curIndexList.value.splice(index, 1);
          removeLine(value);
        }
      };
      const handleChangeProduct = async (productId) => {
        let info = await getIndexByProduct({ productId, tagName: curTag.value });
        if (!Array.isArray(info)) {
          info = [];
        }
        indexOpt.value = info;
      };
      const handleChangeTime = async () => {
        loadingRef.value = true;
        for (let i = 0; i < chartOption.series.length; i++) {
          const param = chartOption.series[i].param;
          param.startDate = tradeDate.value[0];
          param.endDate = tradeDate.value[1];
          const info = await getQuotaData(param);
          Object.assign(chartOption.series[i], { ...info[0], param });
        }
        initLineCharts(true);
        loadingRef.value = false;
      };
      async function addLine(row) {
        const param: paramLineModel = {
          lastFlag: false,
          startDate: tradeDate.value[0],
          endDate: tradeDate.value[1],
          rows: [
            { id: row.id, name: row.name, sourceCode: row.sourceCode, sourceType: row.sourceType },
          ],
          exportPara: quotaDataExportTypeEnum.JSON,
        };
        loadingRef.value = true;
        const info = await getQuotaData(param);
        console.log(info);
        const line = {
          ...info[0],
          type: 'line',
          smooth: true,
          symbol: 'none',
          param,
          configType: IndexConfig[row.id] == undefined ? 'tag' : 'index',
          configValue: IndexConfig[row.id] == undefined ? curTag.value : row.id,
          yAxisIndex:
            IndexConfig[row.id] == undefined
              ? TagConfig[curTag.value] == undefined
                ? 0
                : TagConfig[curTag.value]
              : IndexConfig[row.id],
        };
        chartOption.series.push(line);
        console.log(chartOption);
        checkYaxisShow();
        initLineCharts(false);
        loadingRef.value = false;
      }
      function removeLine(id) {
        chartOption.series = chartOption.series.filter((item) => item.id !== id);
        checkYaxisShow();
        initLineCharts(true);
      }
      function handleIndexContext(e: MouseEvent, item: indexOptModel) {
        createContextMenu({
          event: e,
          items: [
            {
              label: 'Y轴设置',
              icon: 'mdi:cog-outline',
              handler: () => {
                console.log(e);
                setModalProps({
                  title: `Y轴设置(${item.name})`,
                });
                openChartSetModal(true, {
                  obj: { ...item, setStatus: IndexConfig[item.id] == undefined ? false : true },
                  index: IndexConfig[item.id] || TagConfig[curTag.value] || 0,
                  type: 'index',
                });
              },
            },
          ],
        });
      }
      /*********指标模块end***********/

      /*********图表模块start***********/
      const chartRef = ref<HTMLDivElement | null>(null);
      const Chart = useECharts(chartRef as Ref<HTMLDivElement>);
      let chartRefYear: HTMLElement[] = [];
      function setChartRefs(el) {
        if (el) {
          chartRefYear.push(el);
        }
        chartRefYear = chartRefYear.sort(
          (a, b) => Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year')),
        );
      }
      onBeforeUpdate(() => {
        chartRefYear = [];
      });
      const yearOptions: Ref<yearOptionsModel[]> = ref([]);
      const chartOption: any = {
        title: {
          text: `多维监控`,
          left: 'center',
        },
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        grid: {
          top: 90,
          left: 60,
          right: 60,
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
            start: 0,
            end: 100,
          },
          {
            type: 'slider',
          },
        ],
        xAxis: {
          type: 'time',
          boundaryGap: false,
        },
        yAxis: [
          {
            id: 0,
            type: 'value',
            position: 'left',
            show: false,
            axisLine: {
              show: true,
            },
          },
          {
            id: 1,
            type: 'value',
            position: 'right',
            show: false,
            axisLine: {
              show: true,
            },
          },
          {
            id: 2,
            type: 'value',
            position: 'left',
            offset: 60,
            show: false,
            axisLine: {
              show: true,
            },
          },
          {
            id: 3,
            type: 'value',
            position: 'right',
            offset: 60,
            show: false,
            axisLine: {
              show: true,
            },
          },
          {
            id: 4,
            type: 'value',
            position: 'left',
            offset: 120,
            show: false,
            axisLine: {
              show: true,
            },
          },
          {
            id: 5,
            type: 'value',
            position: 'right',
            offset: 120,
            show: false,
            axisLine: {
              show: true,
            },
          },
        ],
        legend: {
          top: '40',
        },
        color: [
          '#FA0000',
          '#333333',
          '#009688',
          '#3b4aff',
          '#FF8C00',
          '#795548',
          '#0091FF',
          '#DA1280',
          '#7A12DA',
          '#12DA73',
          '#DA5F12',
        ],
        series: [],
      };
      initLineCharts();
      function initLineCharts(clear = false) {
        Chart.setOptions(chartOption, clear);
        setTimeout(() => {
          transformEachYearChart();
        }, 500);
      }
      async function transformEachYearChart() {
        let yearOptionsTemp: yearOptionsModel[] = [];
        const start = getYear(tradeDate.value[0]);
        const end = getYear(tradeDate.value[1]);
        for (let i = start; i <= end; i++) {
          const option = cloneDeep(chartOption);
          delete option.dataZoom;
          option.title.text = `多维监控(${i})`;
          for (let j = 0; j < option.series.length; j++) {
            option.series[j].data = option.series[j].data.filter(
              (item) => new Date(item[0]).getFullYear() == i,
            );
          }
          yearOptionsTemp.push({ year: i, option });
        }
        yearOptions.value = yearOptionsTemp;
        await nextTick();
        redrawYearCharts(checkYear.value);
      }
      function redrawYearCharts(checkYear) {
        if (checkYear) {
          chartRefYear.forEach((chart: any, index) => {
            if (chart !== null) {
              const Chart = useECharts(chart as Ref<HTMLDivElement>);
              Chart.setOptions(yearOptions.value[index].option, true);
            }
          });
        }
      }
      //检测Y轴是否显示
      function checkYaxisShow() {
        for (let i = 0; i < chartOption.yAxis.length; i++) {
          let index = chartOption.yAxis[i].id;
          let hasIndex = false;
          for (let j = 0; j < chartOption.series.length; j++) {
            let item = chartOption.series[j];
            let itemIndex;
            if (item.configType == 'tag') {
              itemIndex = TagConfig[item.configValue] ?? 0;
            } else {
              itemIndex = IndexConfig[item.configValue] ?? 0;
            }
            if (itemIndex == index) {
              hasIndex = true;
              break;
            }
          }
          if (hasIndex) {
            chartOption.yAxis[i].show = true;
          } else {
            chartOption.yAxis[i].show = false;
          }
        }
        let left = 1;
        let right = 1;
        let offset: number;
        chartOption.yAxis.forEach((item) => {
          if (item.show) {
            if (item.position == 'left') {
              let temp = Math.ceil(item.id / 2) + 1;
              left = temp > left ? temp : left;
            } else {
              let temp = Math.ceil(item.id / 2);
              right = temp > right ? temp : right;
            }
          }
        });
        offset = left > right ? 60 * left : 60 * right;
        chartOption.grid.left = offset;
        chartOption.grid.right = offset;
      }
      function clearAll() {
        createConfirm({
          iconType: 'warning',
          okButtonProps: {
            type: 'danger',
          },
          content: '确定清空图表内容吗？',
          onOk: () => {
            curIndexList.value = [];
            chartOption.series = [];
            chartOption.yAxis.map((item) => (item.show = false));
            initLineCharts(true);
          },
        });
      }
      /*********图表模块end ***********/
      return {
        loadingRef,
        productId,
        productOptions,
        tradeDate,
        checkYear,
        handleCheckYearChange,
        handleChangeProduct,
        handleChangeTime,

        tagOpt,
        isTagCur,
        handleClickTag,
        OpenTagManage,
        registerTagManage,
        emitTagsSet,
        handleTagContext,
        registerChartSet,
        emitChartSet,
        emitConfigReset,

        indexOpt,
        isIndexCur,
        hasSet,
        handleClickIndex,
        handleIndexContext,

        chartRef,
        setChartRefs,
        yearOptions,

        clearAll,
      };
    },
  });
</script>
<style scoped lang="less">
  .tag-box {
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 14px;
    color: #666;
    padding: 1px 8px;
    margin-right: 8px;
    cursor: pointer;

    &:hover {
      @apply text-primary;
    }

    &.cur {
      @apply bg-primary border border-primary;
      color: #fff;
    }
  }

  .index-box {
    position: relative;
    padding: 0.75rem 0 0.75rem 0.75rem;
    margin: 0.5rem 0 0.5rem 0;
    font-size: 1rem;
    line-height: 1.5rem;
    color: #fff;
    cursor: pointer;
    background-color: rgba(113, 113, 112, 1);

    .triangle {
      width: 0;
      height: 0;
      border-top: 12px solid rgba(66, 66, 66, 1);
      border-right: 12px solid transparent;
      position: absolute;
      top: 0;
      left: 0;
    }

    &.cur {
      @apply bg-primary;

      .triangle {
        border-top: 12px solid #7791e3;
      }
    }
  }
</style>
