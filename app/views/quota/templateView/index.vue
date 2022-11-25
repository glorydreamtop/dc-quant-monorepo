<template>
  <div
    class="h-layout-full overflow-hidden w-full flex flex-col w-full relative page"
    id="templateView-page-wrapper"
  >
    <TreeDrawer
      @selectNode="selectNode"
      placement="left"
      getContainer="#templateView-page-wrapper"
    />
    <ToolBar class="h-24" />
    <Views @edit-temp="updateCurEditCfg" />
    <Edit getContainer="#templateView-page-wrapper" />
  </div>
</template>

<script lang="ts" setup name="templateView">
  import Views from './components/Views.vue';
  import Edit from './components/float/Edit.vue';
  import ToolBar from './components/toolbar/ToolBar.vue';
  import TreeDrawer from './components/float/TreeDrawer.vue';

  import {
    createPageSettingContext,
    createSelectTemplateListContext,
    createTemplateListContext,
    createUniqIdContext,
    insertDOM,
  } from './hooks';
  import { reactive, ref } from 'vue';
  import type { pageSettingType, TemplateDOM } from '/#/template';
  import { useUniqueField } from '../quotaTable/components/helper';
  import { chartConfigType } from '/#/chart';
  import { timeConfigEnum } from '/@/enums/chartEnum';
  import { today, yearsAgo } from '@dq-next/utils/dateUtil';

  const templateList = ref<TemplateDOM[]>([]);
  const selectedTemplateList = ref<TemplateDOM[]>([]);
  const usedUniqId = ref<string[]>([]);
  const pageSetting: pageSettingType = reactive({
    paddingBottom: 32,
    paddingTop: 32,
    paddingLeft: 32,
    paddingRight: 32,
    pagination: false,
    horizontal: false,
    header: {
      show: true,
      left: '笃初诚美 慎终宜令',
      center: '',
      right: '上海笃诚投资管理有限公司',
    },
    footer: {
      show: true,
      left: '内部资料 禁止分发',
      center: '',
      right: '上海笃诚投资管理有限公司',
      pageNum: true,
    },
    showElementborder: true,
    scale: 100,
  });
  const editTempConfig = reactive<TemplateDOM>({
    config: {},
  } as TemplateDOM);
  // 注入模板列表
  createTemplateListContext(templateList);
  // 注入选中的模板列表
  createSelectTemplateListContext(selectedTemplateList);
  // 注入每个模块的uniqId
  createUniqIdContext(usedUniqId);
  // 注入当前页面相关设置
  createPageSettingContext(pageSetting);
  // 获取当前正在编辑的模块配置
  function updateCurEditCfg(config: TemplateDOM) {
    // 清空上次用的
    for (const key in editTempConfig) {
      if (Object.prototype.hasOwnProperty.call(editTempConfig, key)) {
        Reflect.deleteProperty(editTempConfig, key);
      }
    }
    Object.assign(editTempConfig, config);
  }

  const { getUniqueField } = useUniqueField(usedUniqId.value);
  function selectNode(node: TemplateDOM) {
    node.uniqId = getUniqueField();
    node.type = node.version! < 3 ? 'Chart' : 'Table';
    node.pageConfig = {
      width: '400px',
      height: '240px',
      transform: 'translate(0px, 0px)',
    };
    if (node.version! < 3) {
      const config = node.config as chartConfigType;
      if (config.timeConfig.type === timeConfigEnum.default) {
        config.timeConfig.endDate = today();
        config.timeConfig.startDate = yearsAgo(5);
      }
    }
    insertDOM(templateList, selectedTemplateList, node);
  }
</script>

<style lang="less" scoped>
  ::v-deep(.ant-drawer-body) {
    padding: 1rem;
  }

  .page {
    background-color: #e6e6e6;
  }
</style>
