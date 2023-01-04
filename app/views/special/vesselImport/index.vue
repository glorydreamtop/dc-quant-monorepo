<template>
  <div class="p-4 h-layout-full">
    <div class="p-4 bg-white h-full rounded-md shadow-md flex flex-col">
      <div class="py-2 border-b border-gray-300"
        ><BasicForm @register="register" @submit="handleSubmit" :hideRequiredMark="true"
      /></div>
      <transition name="component-fade">
        <div class="relative h-full">
          <div class="mt-2">
            <Tag color="#0d9488">数据更新：{{ updateTimeRef }}</Tag>
            <div class="float-right" v-show="chartShow">
              <Button type="danger" class="mr-10px" @click="clearAll">清空</Button>
              <Button type="primary" @click="openSaveModal">保存至专项列表</Button>
            </div>
          </div>
          <div
            class="absolute top-10 bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden"
            ref="sortContainer"
            v-loading="loading"
            loading-tip="读取数据中..."
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
            <div id="vessel_import_end" class="float-left w-full h-0"></div>
          </div>
        </div>
      </transition>
    </div>
    <ModalSave @register="registerSave" @on-vessel-submit="vesselSubmit" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, Ref, nextTick, onMounted, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Button, Tag } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { DragOutlined, ArrowsAltOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { DoubleSideChart } from '@dq-next/dchart';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useScaleable } from '@dq-next/utils/helper/commonHelper';
  import { useSortable } from '/@/hooks/web/useSortable';
  import {
    postSaveOrUpdate,
    getVesselImportDataQuery,
    getVesselUpdateTime,
  } from '@dq-next/http-apis/special/index';
  import { schemas } from './formData';
  import { cloneDeep, remove, isNil } from 'lodash-es';
  import { useModal } from '/@/components/Modal';
  import ModalSave from './components/ModalSave.vue';
  import { getSpecialInfoById } from '@dq-next/http-apis/special/index';
  import { generateVesselImportConfig } from '../specialCommon';
  export default defineComponent({
    name: 'VesselImport',
    components: {
      Button,
      Tag,
      BasicForm,
      DoubleSideChart,
      ArrowsAltOutlined,
      DragOutlined,
      DeleteOutlined,
      ModalSave,
    },
    setup() {
      const loading = ref(false);
      const sortContainer = ref<HTMLElement>();
      const { createMessage, createConfirm } = useMessage();
      const [register, { getFieldsValue }] = useForm({
        labelWidth: 100,
        schemas: schemas,
        actionColOptions: {
          span: 6,
          offset: 10,
        },
      });
      const chartrefs: ComponentElRef[] = [];
      function setChartRefs(el) {
        if (!el?.tableNum && !chartrefs.includes(el)) {
          chartrefs.push(el);
        }
      }
      const updateTimeRef: Ref<string> = ref('');
      const selectedTemplate: any = reactive([]);
      const chartShow = ref(false);
      let params: any = null;
      /*********更新时间 start *************/
      updateTimeInit();
      async function updateTimeInit() {
        const timeObj = await getVesselUpdateTime();
        updateTimeRef.value = timeObj.time;
      }
      /*********更新时间 end  *************/
      /*********是否编辑模板start *************/
      const router = useRouter();
      const specialId = router.currentRoute.value.query.id;
      if (specialId) {
        setParams();
      }
      let editInfo: any;
      async function setParams() {
        loading.value = true;
        chartShow.value = true;
        editInfo = await getSpecialInfoById({ id: specialId });
        const options = JSON.parse(editInfo.options);
        let template = getFieldsValue();
        for (let i = 0; i < options.length; i++) {
          options[i].departure_date_from = template.date[0].split(' ')[0];
          options[i].departure_date_to = template.date[1].split(' ')[0];
          let params = options[i];
          try {
            const res: any = await getVesselImportDataQuery(params);
            if (res.length == 0) {
              createMessage.warning('数据为空');
            } else {
              if (params.group_load == '') {
                initChart(res, params);
              } else {
                const multiRes = processVesselRes(res, params);
                initCharts(multiRes, params);
              }
            }
          } catch (error) {}
        }
        loading.value = false;
      }
      /*********是否编辑模板end *************/
      async function handleSubmit() {
        chartShow.value = true;
        params = getFieldsValue();
        params = processParams(params);
        loading.value = true;
        try {
          const res: any = await getVesselImportDataQuery(params);
          if (res.length == 0) {
            createMessage.warning('数据为空');
          } else {
            if (params.group_load == '') {
              initChart(res, params);
            } else {
              const multiRes = processVesselRes(res, params);
              initCharts(multiRes, params);
            }
          }
        } catch (error) {}
        loading.value = false;
      }
      // 处理多图数据
      function processVesselRes(res, params) {
        let curType = params.group_load;
        if (params.query_type == 'net_import' || params.query_type == 'import') {
          curType = curType.replace(/load/, 'discharge');
        }
        const formatRes = {};
        for (let i = 0; i < res.length; i++) {
          const key = res[i][curType];
          if (formatRes[key]) {
            formatRes[key].push(res[i]);
          } else {
            formatRes[key] = [res[i]];
          }
        }
        return formatRes;
      }
      // 请求参数加工
      function processParams(params) {
        params.departure_date_from = params.date[0].split(' ')[0];
        params.departure_date_to = params.date[1].split(' ')[0];
        params.product = params.product || [];
        params.grade = params.grade || [];
        params.load_region = params.load_region || [];
        params.load_country = params.load_country || [];
        params.load_port = params.load_port || [];
        params.load_zone = params.load_zone || [];
        params.group_load = params.group_load || '';
        params.dereplication = params.dereplication || '';
        params.dates_relation = 'or';
        params.discharge_region = params.discharge_region || [];
        params.discharge_country = params.discharge_country || [];
        params.discharge_port = params.discharge_port || [];
        params.discharge_zone = params.discharge_zone || [];
        params.arrival_date_from = params.arrival_date_from || '';
        params.arrival_date_to = params.arrival_date_to || '';
        params.group_discharge = params.group_discharge || '';
        params.group_date_type = params.group_date_type || '';
        params.chart_title = params.chart_title || '';
        for (let key in params) {
          if (typeof params[key] === 'object') {
            params[key] = JSON.stringify(params[key]);
          }
        }
        return params;
      }
      async function initChart(res, params) {
        const configParams = generateVesselImportConfig(res, params);
        selectedTemplate.push({
          id: `vessel${new Date().getTime()}`,
          config: configParams,
          options: initChartOptions(params),
        });
        await nextTick();
        // redrawCharts();
        (document.getElementById('vessel_import_end') as HTMLElement).scrollIntoView({
          behavior: 'smooth',
        });
      }
      async function initCharts(resData, params) {
        for (const key in resData) {
          const configParams = generateVesselImportConfig(resData[key], params);
          configParams.title = params.chart_title == '' ? key : params.chart_title;
          selectedTemplate.push({
            id: `${key}${new Date().getTime()}`,
            config: configParams,
            options: initChartOptions(params, key),
          });
        }
        await nextTick();
        // redrawCharts();
        (document.getElementById('vessel_import_end') as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
      // 返回单个图表配置参数
      function initChartOptions(params, key: boolean | string = false) {
        let template = cloneDeep(params);
        if (key) {
          template[params.group_load] = `["${key}"]`;
          if (template.chart_title == '') {
            template.chart_title = key;
          }
        }
        return template;
      }
      function redrawCharts() {
        chartrefs.forEach((chart: ComponentElRef & { paint: () => void }) => {
          if (chart != null) {
            chart.paint();
          }
        });
      }
      /***********保存start************/
      const [registerSave, { openModal: openModalSave }] = useModal();
      function openSaveModal() {
        openModalSave(true, editInfo);
      }
      async function vesselSubmit(values) {
        let chartsOptions: any = [];
        selectedTemplate.forEach((item: any) => {
          chartsOptions.push(item.options);
        });
        const submitParams: any = {
          specialName: values.name,
          specialType: 'vessel IMP&EXP',
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
        remove(selectedTemplate, (template: any) => template.id === id);
        redrawCharts();
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
        register,
        handleSubmit,
        chartShow,
        updateTimeRef,
        selectedTemplate,
        setChartRefs,
        sortContainer,
        registerSave,
        openSaveModal,
        vesselSubmit,
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
