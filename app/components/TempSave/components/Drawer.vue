<template>
  <BasicDrawer
    @register="register"
    header-style="display:none"
    :scrollOptions="{ enableScroll: false }"
  >
    <div
      class="flex flex-col h-full p-4 overflow-hidden"
      v-loading="loading"
      loading-tip="保存中..."
    >
      <TemplateTree
        ref="drawerTree"
        :show-search="false"
        class="w-full drawerTree"
        @select-folder="selectFolder"
      />
      <div class="grid grid-cols-2 grid-rows-3 gap-4 row-auto h-210px border-t pt-2">
        <div class="col-span-2 row-span-1 flex items-center flex-wrap gap-y-1">
          <span class="whitespace-nowrap">上次选中的目录</span>
          <template v-for="name in historyPath.path" :key="name">
            <Icon class="arrow" size="12" icon="ant-design:right-outlined" />
            <span
              class="bg-gray-100 leading-5 px-1 border border-gray-400 whitespace-nowrap name"
              >{{ name }}</span
            >
          </template>
          <BasicHelp text="使用这个位置">
            <Icon
              @click="applyPath"
              :class="[historyPath.path === folderPath.path ? 'same' : '']"
              size="18"
              icon="ant-design:check-circle-outlined"
            />
          </BasicHelp>
        </div>
        <div class="col-span-2 row-span-1 flex items-center flex-wrap gap-y-1">
          <span class="whitespace-nowrap">选中的目录</span>
          <template v-for="name in folderPath.path" :key="name">
            <Icon class="arrow" size="12" icon="ant-design:right-outlined" />
            <span
              class="bg-gray-100 leading-5 px-1 border border-gray-400 whitespace-nowrap name"
              >{{ name }}</span
            >
          </template>
        </div>
        <Button block type="primary" @click="saveTemplate">保存</Button>
        <Button block>另存为</Button>
      </div>
    </div>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { reactive, ref, toRaw } from 'vue';
  import { useRoute } from 'vue-router';
  import { Button } from 'ant-design-vue';
  import { chartConfigType } from '/#/chart';
  import { updateTemplate } from '@dq-next/http-apis/template';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import Icon from '/@/components/Icon';
  import { TemplateTree } from '/@/components/TemplateTree';
  import { BasicHelp } from '/@/components/Basic';
  import { CategoryTreeModel } from '/#/quota';
  import { getPathHistory, setPathHistory, folderPathType } from '../helper';
  import { TemplateApiNeed } from '/#/template';
  import { CategoryTreeType } from '/@/enums/quotaEnum';

  // 接口需要的格式
  interface templateConfigApiNeed {
    config: object;
    category_id: number;
  }

  const route = useRoute();
  // 从路由获取当前编辑的模板ID，没有就是NaN
  const templateId = parseInt((route.params.templateId ?? '') as string);

  const [register, { closeDrawer }] = useDrawerInner(
    ({ chartConfig, categoryId }: { chartConfig: chartConfigType; categoryId: number }) => {
      configApiNeed.config = chartConfig;
      Object.assign(historyPath, getPathHistory());
    },
  );
  const configApiNeed: templateConfigApiNeed = reactive({
    config: {},
    category_id: NaN,
  });
  const tempInfo: TemplateApiNeed = reactive({
    temolate_name: '',
    template: '',
    type: CategoryTreeType.sysTemplate,
    id: templateId || void 0,
  });

  const folderPath: folderPathType = reactive({
    path: [],
    categoryId: NaN,
  });
  const historyPath: folderPathType = reactive({
    path: [],
    categoryId: NaN,
  });

  const loading = ref(false);

  function selectFolder(
    folderNode: CategoryTreeModel,
    path: string[],
    type: CategoryTreeType.sysTemplate | CategoryTreeType.userTemplate,
  ) {
    folderPath.path = path;
    folderPath.categoryId = folderNode.id;
    tempInfo.type = type;
  }

  function applyPath() {
    Object.assign(folderPath, historyPath);
  }

  async function saveTemplate() {
    loading.value = true;
    configApiNeed.category_id = folderPath.categoryId;
    tempInfo.template = JSON.stringify(configApiNeed);
    await updateTemplate(tempInfo);
    setPathHistory(toRaw(folderPath));
    loading.value = false;
    closeDrawer();
  }
</script>

<style lang="less" scoped>
  .drawerTree {
    max-height: calc(100% - 210px);
    height: calc(100% - 210px);
  }

  .name:last-of-type {
    background: lighten(@primary-color, 10%);
    color: @white;
  }

  .same {
    color: @primary-color!important;
  }
</style>
