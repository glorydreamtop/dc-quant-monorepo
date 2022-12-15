<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModelPreview"
    title="预览"
    :canFullscreen="false"
    :width="1200"
  >
    <template #footer>
      <div>
        <div class="float-left">
          <template v-if="specialType !== 'vessel report'">
            <RangePicker
              v-model:value="timeRange"
              valueFormat="YYYY-MM-DD"
              @change="changeTime"
              :allowClear="false"
            />
          </template>
          <template v-else>
            <RangePicker
              v-model:value="departureRange"
              valueFormat="YYYY-MM-DD"
              :placeholder="['Start departure', 'End departure']"
              @change="changeTime"
            />
            <RangePicker
              v-model:value="arrivalRange"
              valueFormat="YYYY-MM-DD"
              :placeholder="['Start arrival', 'End arrival']"
              @change="changeTime"
              style="margin-left: 10px"
            />
          </template>
        </div>
        <a-button type="primary" @click="screenShot">保存为图片</a-button>
      </div>
    </template>
    <div
      class="flex flex-wrap w-full pt-2 pb-4 content-start overflow-y-auto"
      v-loading="loading"
      loading-tip="读取数据中..."
    >
      <div ref="sortContainer" class="w-full">
        <template v-for="(item, index) in templates" :key="index">
          <div class="relative scaleable w-1/2 h-400px float-left group mb-6">
            <!-- <Chart v-bind="item.config" class="flex-grow" :ref="setChartRefs" /> -->
            <DoubleSideChart
              :config="item.config"
              :class="['w-full h-full text-base py-2']"
              class="flex-grow"
              :ref="setChartRefs"
            />
            <div
              class="absolute bottom-0 right-5 scale z-9 cursor-nw-resize hidden group-hover:block"
            >
              <ArrowsAltOutlined :rotate="90" :style="{ fontSize: '18px' }" />
            </div>
          </div>
        </template>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, unref, nextTick } from 'vue';
  import { DatePicker } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { DoubleSideChart } from '@dq-next/dchart';
  import {
    getSpecialInfoById,
    getStatDataQuery,
    getVesselImportDataQuery,
    getVesselStatDataQuery,
  } from '@dq-next/http-apis/special/index';
  import { useScaleable } from '@dq-next/utils/helper/commonHelper';
  import { ArrowsAltOutlined } from '@ant-design/icons-vue';
  import { defaultChartCfg } from '../../specialCommon';
  import { useVersionTransfer } from '@dq-next/utils/helper/versionTransfer';
  import { cloneDeep } from 'lodash-es';
  import { dom2imgFile, fileType } from '@dq-next/utils/domUtils';
  import { downloadByData } from '@dq-next/utils/file';
  import { formatToDate, yearsAgo } from '@dq-next/utils/dateUtil';
  import { selectedTemplateModel, optionsModel, configModel } from '../model';
  import {
    generateVesselImportConfig,
    completeXAxis,
    generateVesselReportConfig,
  } from '../../specialCommon';
  export default defineComponent({
    components: {
      BasicModal,
      DoubleSideChart,
      RangePicker: DatePicker.RangePicker,
      ArrowsAltOutlined,
    },
    setup() {
      const loading = ref(false);
      const sortContainer = ref<HTMLElement>();
      const { huiChart } = useVersionTransfer();
      let imgTitle = '';
      let specialType = ref('jodi');
      const templates = reactive<selectedTemplateModel[]>([]);
      const timeRange = ref([yearsAgo(6), formatToDate()]);
      const arrivalRange = ref([yearsAgo(6), formatToDate()]);
      const departureRange = ref([]);
      const cfgTemp = { ...cloneDeep(defaultChartCfg), http: false, fixData: [] };
      cfgTemp.colorsId = 22;
      let options: optionsModel[];
      //提交参数
      const [registerModelPreview, { closeModal }] = useModalInner(async (values) => {
        setScale();
        resetData();
        loading.value = true;
        imgTitle = values.specialName;
        specialType.value = values.specialType;
        const info = await getSpecialInfoById({ id: values.id });
        options = JSON.parse(info.options);
        for (let i = 0; i < options.length; i++) {
          if (specialType.value == 'jodi') {
            options[i].start_dt = timeRange.value[0];
            options[i].end_dt = timeRange.value[1];
            const res = await getStatDataQuery(options[i]);
            if (typeof res === 'string') {
              initJodiChart(res, options[i]);
            } else {
              initJodiCharts(res, options[i]);
            }
          } else if (specialType.value == 'vessel IMP&EXP') {
            options[i].departure_date_from = timeRange.value[0];
            options[i].departure_date_to = timeRange.value[1];
            const res = await getVesselImportDataQuery(options[i]);
            initVesselImportChart(res, options[i]);
          } else if (specialType.value == 'vessel report') {
            options[i].departure_date_from = departureRange.value.length
              ? departureRange.value[0]
              : '';
            options[i].departure_date_to = departureRange.value.length
              ? departureRange.value[1]
              : '';
            options[i].arrival_date_from = arrivalRange.value.length ? arrivalRange.value[0] : '';
            options[i].arrival_date_to = arrivalRange.value.length ? arrivalRange.value[1] : '';
            const res = await getVesselStatDataQuery(options[i]);
            initVesselReportChart(res, options[i]);
          }
        }
        await nextTick();
        // redrawCharts();
        loading.value = false;
      });
      function resetData() {
        templates.splice(0, templates.length);
        chartrefs.splice(0, chartrefs.length);
        timeRange.value[0] = yearsAgo(6);
        timeRange.value[1] = formatToDate();
      }
      /**************jodi start *************/
      async function initJodiChart(res, params) {
        let resData = JSON.parse(res);
        resData = completeXAxis(resData, params);
        const configParams: configModel = cloneDeep(cfgTemp);
        configParams.title =
          params.chart_title == undefined || params.chart_title == ''
            ? 'JODI数据展示'
            : params.chart_title;
        configParams.seriesCfgMap = {
          JODI数据: { title: 'JODI数据', type: 'line', lineWidth: 2, yAxisIndex: 0 },
        };
        configParams.startDate = params.start_dt;
        configParams.endDate = params.end_dt;
        configParams.type = params.chart_type;
        configParams.fixData = [
          {
            data: resData.map((item) => [item.dt, item.val]),
            id: 1,
            name: 'JODI数据',
          },
        ];
        const temp = huiChart({
          config: configParams,
        });
        templates.push({ config: temp });
      }
      async function initJodiCharts(res, params) {
        for (const key in res) {
          const configParams: configModel = cloneDeep(cfgTemp);
          configParams.title =
            params.chart_title == undefined || params.chart_title == '' ? key : params.chart_title;
          configParams.seriesCfgMap = {
            [key]: { title: key, type: 'line', lineWidth: 2, yAxisIndex: 0 },
          };
          configParams.startDate = params.start_dt;
          configParams.endDate = params.end_dt;
          configParams.type = params.chart_type;
          let arrayData = JSON.parse(res[key]);
          arrayData = completeXAxis(arrayData, params);
          configParams.fixData = [
            {
              data: arrayData.map((item) => [item.dt, item.val]),
              id: key,
              name: key,
            },
          ];
          const temp = huiChart({
            config: configParams,
          });
          templates.push({ config: temp });
        }
      }
      /**************jodi end *************/
      /**************vessel import start *************/
      async function initVesselImportChart(res, params) {
        const configParams = generateVesselImportConfig(res, params);
        templates.push({ config: configParams });
      }
      /**************vessel end *************/
      /**************vessel report start *************/
      async function initVesselReportChart(res, params) {
        const configParams = generateVesselReportConfig(res, params);
        templates.push({ config: configParams });
      }
      /**************vessel end *************/
      async function changeTime() {
        loading.value = true;
        templates.splice(0, templates.length);
        chartrefs.splice(0, chartrefs.length);
        for (let i = 0; i < options.length; i++) {
          if (specialType.value == 'jodi') {
            options[i].start_dt = timeRange.value[0];
            options[i].end_dt = timeRange.value[1];
            const res = await getStatDataQuery(options[i]);
            if (typeof res === 'string') {
              initJodiChart(res, options[i]);
            } else {
              initJodiCharts(res, options[i]);
            }
          } else if (specialType.value == 'vessel IMP&EXP') {
            options[i].departure_date_from = timeRange.value[0];
            options[i].departure_date_to = timeRange.value[1];
            const res = await getVesselImportDataQuery(options[i]);
            initVesselImportChart(res, options[i]);
          } else if (specialType.value == 'vessel report') {
            options[i].departure_date_from = departureRange.value.length
              ? departureRange.value[0]
              : '';
            options[i].departure_date_to = departureRange.value.length
              ? departureRange.value[1]
              : '';
            options[i].arrival_date_from = arrivalRange.value.length ? arrivalRange.value[0] : '';
            options[i].arrival_date_to = arrivalRange.value.length ? arrivalRange.value[1] : '';
            const res = await getVesselStatDataQuery(options[i]);
            initVesselReportChart(res, options[i]);
          }
        }
        await nextTick();
        redrawCharts();
        loading.value = false;
      }
      async function handleClose() {
        templates.splice(0, templates.length);
        closeModal();
      }
      //重新绘制图表
      async function redrawCharts() {
        chartrefs.forEach((chart: ComponentElRef & { paint: () => void }) => {
          if (chart != null) {
            chart.paint();
          }
        });
      }
      //图表对象
      const chartrefs: ComponentElRef[] = [];
      function setChartRefs(el) {
        if (!el?.tableNum && !chartrefs.includes(el)) {
          chartrefs.push(el);
        }
      }
      function setScale() {
        const container: HTMLElement = unref(sortContainer)!;
        useScaleable(
          { container, boxName: '.scaleable', scaleName: '.scale' },
          {
            x: true,
            y: true,
            staticMode: false,
            onEnd: () => {},
          },
        );
      }
      /*********保存图片start *********/
      async function screenShot() {
        loading.value = true;
        const screenshotBlob = await dom2imgFile({
          dom: unref(sortContainer)!,
          type: fileType.BLOB,
        });
        downloadByData(screenshotBlob as Blob, `${imgTitle}.jpeg`);
        loading.value = false;
      }
      /*********保存图片end *********/
      return {
        sortContainer,
        registerModelPreview,
        closeModal,
        handleClose,
        templates,
        specialType,
        timeRange,
        arrivalRange,
        departureRange,
        changeTime,
        setChartRefs,
        loading,
        screenShot,
      };
    },
  });
</script>
