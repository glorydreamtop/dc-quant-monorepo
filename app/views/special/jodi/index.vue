<template>
  <div class="p-4 h-layout-full">
    <div class="p-4 bg-white h-full rounded-md shadow-md flex flex-col">
      <div class="py-2 border-b border-gray-300"
        ><BasicForm @register="register" @submit="handleSubmit" :hideRequiredMark="true"
      /></div>
      <transition name="component-fade">
        <div
          class="relative h-full"
          v-show="chartShow"
          v-loading="loading"
          loading-tip="读取数据中..."
        >
          <div class="text-right mt-2">
            <Button type="danger" class="mr-10px" @click="clearAll">清空</Button>
            <Button type="primary" @click="openSaveModal">保存至专项列表</Button>
          </div>
          <div
            class="absolute top-10 bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden"
            ref="sortContainer"
          >
            <template v-for="item in selectedTemplate" :key="item.id">
              <div
                class="relative scaleable"
                :class="selectedTemplate.length < 2 ? 'w-full h-full' : 'w-1/2 h-400px float-left'"
              >
                <DoubleSideChart
                  :config="item.config"
                  :class="['w-full h-full text-base py-2']"
                  class="flex-grow"
                  :ref="setChartRefs"
                />
                <div class="absolute bottom-2 right-3 scale z-9 cursor-nw-resize">
                  <ArrowsAltOutlined :rotate="90" :style="{ fontSize: '18px' }" />
                </div>
                <div class="absolute top-2 right-10 cursor-move drag z-9">
                  <DragOutlined :style="{ fontSize: '18px' }" />
                </div>
                <div class="absolute top-2 right-3 cursor-pointer z-9" @click="delEle(item.id)">
                  <DeleteOutlined :style="{ fontSize: '18px' }" />
                </div>
              </div>
            </template>
            <div class="float-left w-full h-0" ref="jodiEnd"></div>
          </div>
        </div>
      </transition>
    </div>
    <ModalSave @register="registerSave" @on-jodi-submit="jodiSubmit" />
  </div>
</template>
<script lang="ts">
  import { dateUtil } from '@dq-next/utils/dateUtil';
  import { defineComponent, reactive, ref, nextTick, onMounted, unref } from 'vue';
  import { useRoute } from 'vue-router';
  import { Button } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { DragOutlined, ArrowsAltOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { DoubleSideChart } from '@dq-next/dchart';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useScaleable } from '@dq-next/utils/helper/commonHelper';
  import { useSortable } from '/@/hooks/web/useSortable';
  import {
    getStatDataQuery,
    postSaveOrUpdate,
    getSpecialInfoById,
  } from '@dq-next/http-apis/special/index';
  import { schemas } from './formData';
  import { cloneDeep, remove, isNil } from 'lodash-es';
  import { useModal } from '/@/components/Modal';
  import ModalSave from './components/ModalSave.vue';
  import { defaultChartCfg } from '../specialCommon';
  import { useVersionTransfer } from '@dq-next/utils/helper/versionTransfer';
  import {
    selectedTemplateModel,
    optionsModel,
    configModel,
    editInfoModel,
    submitParamsModel,
  } from './model';
  export default defineComponent({
    name: 'Jodi',
    components: {
      Button,
      BasicForm,
      DoubleSideChart,
      ArrowsAltOutlined,
      DragOutlined,
      DeleteOutlined,
      ModalSave,
    },
    setup() {
      const { huiChart } = useVersionTransfer();
      const loading = ref(false);
      const jodiEnd = ref<HTMLElement>();
      const sortContainer = ref<HTMLElement>();
      const { createMessage, createConfirm } = useMessage();
      const [register, { getFieldsValue }] = useForm({
        labelWidth: 100,
        schemas: schemas,
        actionColOptions: {
          span: 6,
        },
      });
      const chartrefs: ComponentElRef[] = [];
      function setChartRefs(el) {
        if (!el?.tableNum && !chartrefs.includes(el)) {
          chartrefs.push(el);
        }
      }
      const cfgTemp = { ...cloneDeep(defaultChartCfg), http: false, colorsId: 22, fixData: [] };
      const selectedTemplate = reactive<selectedTemplateModel[]>([]);
      const chartShow = ref(false);
      let params: optionsModel | null = null;
      /*********是否编辑模板start *************/
      const route = useRoute();
      const specialId = route.query.id;
      if (specialId) {
        setParams();
      }
      let editInfo: editInfoModel;
      async function setParams() {
        loading.value = true;
        chartShow.value = true;
        editInfo = await getSpecialInfoById({ id: specialId });
        const options = JSON.parse(editInfo.options);
        let template = getFieldsValue();
        for (let i = 0; i < options.length; i++) {
          options[i].start_dt = template.timeRange[0].split(' ')[0];
          options[i].end_dt = template.timeRange[1].split(' ')[0];
          const res = await getStatDataQuery(options[i]);
          if (typeof res === 'string') {
            initChart(res, options[i]);
          } else {
            initCharts(res, options[i]);
          }
        }
        loading.value = false;
      }
      /*********是否编辑模板end *************/
      async function handleSubmit() {
        chartShow.value = true;
        params = getFieldsValue() as optionsModel;
        params.start_dt = params.timeRange[0].split(' ')[0];
        params.end_dt = params.timeRange[1].split(' ')[0];
        params.products = params.products || [];
        params.regions = params.region || [];
        params.countries = params.country || [];
        params.group_dt = params.group_dt || '';
        params.group_district = params.group_district || '';
        params.chart_title = params.chart_title || '';
        loading.value = true;
        const res: string | object = await getStatDataQuery(params);
        loading.value = false;
        if (typeof res === 'string') {
          if (JSON.parse(res).length == 0) {
            createMessage.warning('数据为空');
          } else {
            initChart(res, params);
          }
        } else {
          initCharts(res, params);
        }
      }
      async function initChart(res, params) {
        let resData = JSON.parse(res);
        resData = completeXAxis(resData, params);
        const configParams: configModel = cloneDeep(cfgTemp);
        configParams.title = params.chart_title == '' ? 'JODI数据展示' : params.chart_title;
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
        console.log(configParams);
        const temp = huiChart({
          config: configParams,
        });
        console.log(temp);
        selectedTemplate.push({
          id: `jodi${new Date().getTime()}`,
          config: temp,
          options: initChartOptions(params),
        });
        await nextTick();
        jodiEnd.value!.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      async function initCharts(resData, params) {
        for (const key in resData) {
          const configParams: configModel = cloneDeep(cfgTemp);
          configParams.title = params.chart_title == '' ? key : params.chart_title;
          configParams.seriesCfgMap = {
            [key]: { title: key, type: 'line', lineWidth: 2, yAxisIndex: 0 },
          };
          configParams.startDate = params.start_dt;
          configParams.endDate = params.end_dt;
          configParams.type = params.chart_type;
          let arrayData = JSON.parse(resData[key]);
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
          selectedTemplate.push({
            id: `jodi${new Date().getTime()}`,
            config: temp,
            options: initChartOptions(params, key),
          });
        }
        await nextTick();
        jodiEnd.value!.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      // 返回单个图表配置参数
      function initChartOptions(params, key: string | boolean = false) {
        let template = cloneDeep(params);
        if (key) {
          if (template.group_district == 'country') {
            template.countries = [key];
          } else {
            template.regions = [key];
          }
        }
        return template;
      }
      //补全一月一号
      function completeXAxis(data, params) {
        if (data.length > 0) {
          if (dateUtil(data[0].dt).format('MM-DD') != '01-01' && params.chart_type == 'seasonal') {
            const year = dateUtil(data[0].dt).year();
            const timeVal = dateUtil(`${year}-01-01`).valueOf();
            data.unshift({ dt: timeVal, val: null });
            return data;
          } else {
            return data;
          }
        } else {
          return data;
        }
      }
      /***********保存start************/
      const [registerSave, { openModal: openModalSave }] = useModal();
      function openSaveModal() {
        openModalSave(true, editInfo);
      }
      async function jodiSubmit(values) {
        let chartsOptions: optionsModel[] = [];
        selectedTemplate.forEach((item: selectedTemplateModel) => {
          chartsOptions.push(item.options);
        });
        const submitParams: submitParamsModel = {
          specialName: values.name,
          specialType: 'jodi',
          options: JSON.stringify(chartsOptions),
        };
        if (editInfo) {
          submitParams.id = editInfo.id;
        }
        await postSaveOrUpdate(submitParams);
        createMessage.success('专项数据保存成功');
      }
      /***********保存end************/
      function clearAll() {
        createConfirm({
          title: '清空',
          content: '确认清空图表吗？',
          iconType: 'warning',
          onOk: () => {
            selectedTemplate.splice(0, selectedTemplate.length);
            chartrefs.splice(0, chartrefs.length);
          },
        });
      }
      function delEle(id) {
        remove(selectedTemplate, (template: selectedTemplateModel) => template.id === id);
      }
      function setSortable() {
        const el: HTMLElement | undefined = unref(sortContainer);
        const { initSortable } = useSortable(el as HTMLElement, {
          handle: '.drag',
          onEnd: (evt) => {
            const { oldIndex, newIndex } = evt;
            if (isNil(oldIndex) || isNil(newIndex) || oldIndex === newIndex) {
              return;
            }
            // Sort column
            const columns = selectedTemplate;
            if (oldIndex > newIndex) {
              columns.splice(newIndex, 0, columns[oldIndex]);
              columns.splice(oldIndex + 1, 1);
            } else {
              columns.splice(newIndex + 1, 0, columns[oldIndex]);
              columns.splice(oldIndex, 1);
            }
          },
        });
        initSortable();
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
      onMounted(() => {
        // 可拖动
        setSortable();
        // 可拉伸
        setScale();
      });
      return {
        loading,
        jodiEnd,
        register,
        handleSubmit,
        chartShow,
        selectedTemplate,
        setChartRefs,
        sortContainer,
        registerSave,
        openSaveModal,
        jodiSubmit,
        clearAll,
        delEle,
      };
    },
  });
</script>
<style lang="less" scoped>
  .component-fade-enter-active,
  .component-fade-leave-active {
    transition: all 0.8s ease;
    opacity: 1;
  }

  .component-fade-enter-from,
  .component-fade-leave-to {
    transform: scale(0.5);
    opacity: 0;
  }
</style>
