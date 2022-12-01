<template>
  <div class="bg-white">
    <TemplateSearch v-if="showSearch" @select="handleSelect" />
    <Icon
      v-repeat-click="getData"
      class="refresh-icon"
      icon="ant-design:sync-outlined"
      :spin="loading[CategoryTreeType.sysTemplate]"
    />
    <Tabs v-model:activeKey="treeType" class="tabs" centered>
      <TabPane :key="CategoryTreeType.sysTemplate" :tab="t('template.sysTemplate')">
        <BasicTree
          v-loading="loading[CategoryTreeType.sysTemplate]"
          v-bind="treeProps[CategoryTreeType.sysTemplate]"
          ref="sysTree"
          @select="handleTreeSelect"
        >
          <template #title="item">
            <Icon :icon="item.icon" />
            <span
              class="select-none tree-node w-full"
              :data-folderId="item.folder ? item.key : undefined"
              :data-LeafId="!item.folder ? item.key : undefined"
              >{{ nodeFilter(item) }}</span
            >
          </template>
        </BasicTree>
      </TabPane>
      <TabPane :key="CategoryTreeType.userTemplate" :tab="t('template.userTemplate')">
        <BasicTree
          v-bind="treeProps[CategoryTreeType.userTemplate]"
          ref="userTree"
          @select="handleTreeSelect"
      /></TabPane>
    </Tabs>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref, unref, toRefs, nextTick } from 'vue';
  import { TemplateSearch } from '../index';
  import { BasicTree } from '/@/components/Tree/index';
  import type { ContextMenuItem } from '/@/components/Tree/index';
  import type { TreeItem, TreeActionType } from '/@/components/Tree/index';
  import { Tabs } from 'ant-design-vue';
  import { getDirTemplate, getTemplateTree } from '@dq-next/http-apis/template';
  import type { CategoryTreeModel } from '/#/quota';
  import { CategoryTreeType } from '/@/enums/quotaEnum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Icon } from '@dq-next/icon';
  import { findNode, findPath, forEach } from '@dq-next/utils/helper/treeHelper';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { uniq, pick } from 'lodash-es';
  import { useTimeoutFn } from '/@/hooks/core/useTimeout';
  import { useHighLight, useMultiSelect, useTemplateVersion } from '../hooks';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import type { treeSelectParams, treePropsModel, TemplateType, searchItemType } from '../types';
  import type { TemplateItem } from '/#/template';
  import { versionEnum } from '/@/enums/chartEnum';
  import { useVersionTransfer } from '@dq-next/utils/helper/versionTransfer';

  const emit = defineEmits<{
    (event: 'selectNode', node: TemplateItem): void;
    (
      event: 'selectFolder',
      folder: CategoryTreeModel,
      path: string[],
      type: CategoryTreeType.sysTemplate | CategoryTreeType.userTemplate,
    ): void;
  }>();
  const props = defineProps<{
    showSearch: boolean;
  }>();
  const { showSearch } = toRefs(props);
  const HIGHTLIGHT = 'select-hightlight';
  const TabPane = Tabs.TabPane;
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const treeType = ref<TemplateType>(CategoryTreeType.sysTemplate);

  const { getTemplateIcon, getTemplateName } = useTemplateVersion();
  const { pingChart, huiChart, proChart } = useVersionTransfer();
  const isFolder = (node: TemplateItem | CategoryTreeModel) =>
    Reflect.has(node, 'folder') && (node as CategoryTreeModel).folder;
  function iconFilter(node: TemplateItem | CategoryTreeModel) {
    const folderIcon = 'ant-design:folder-outlined';
    return isFolder(node) ? folderIcon : getTemplateIcon(node as TemplateItem);
  }
  function nodeFilter(item: TemplateItem | CategoryTreeModel) {
    if (Reflect.has(item, 'version')) {
      return getTemplateName(item as TemplateItem);
    } else {
      return item.name;
    }
  }
  const treeProps: treePropsModel = reactive({
    [CategoryTreeType.sysTemplate]: {
      treeData: [],
      fieldNames: {
        title: 'name',
      },
      blockNode: true,
      clickRowToExpand: true,
      loadData: ({ eventKey }) => loadData(eventKey),
      beforeRightClick,
    },
    [CategoryTreeType.userTemplate]: {
      treeData: [],
      fieldNames: {
        title: 'name',
      },
      blockNode: true,
      clickRowToExpand: true,
      loadData: ({ eventKey }) => loadData(eventKey),
      beforeRightClick,
    },
  });
  const loading = reactive({
    [CategoryTreeType.sysTemplate]: false,
    [CategoryTreeType.userTemplate]: false,
  });
  async function getData(type: TemplateType = unref(treeType)) {
    loading[treeType.value] = true;
    const expandedKeys = getTreeInstance(treeType.value)?.getExpandedKeys() || null;
    try {
      const res = (await getTemplateTree({ type })) as Partial<CategoryTreeModel & TreeItem>[];
      forEach(res, (item) => {
        item.isLeaf = !item.folder;
        item.icon = 'flat-color-icons:folder';
        if (expandedKeys && expandedKeys.includes(item.key!) && !item.children) {
          loadData(item.key!);
        }
      });
      treeProps[type].treeData = res;
      createMessage.success(t('sys.api.getOK'));
    } catch (error) {
      createMessage.error(t('sys.api.getFailed'));
    } finally {
      useTimeoutFn(() => {
        loading[treeType.value] = false;
      }, 960);
    }
  }

  const sysTree = ref<TreeActionType & ComponentRef>();
  const userTree = ref<TreeActionType & ComponentRef>();

  function getTreeInstance(type: TemplateType) {
    if (type === CategoryTreeType.sysTemplate && unref(sysTree)) {
      return unref(sysTree);
    }
    if (type === CategoryTreeType.userTemplate && unref(userTree)) {
      return unref(userTree);
    }
    throw new Error('tree instance did not inited or mounted!');
  }

  async function loadData(key: number) {
    const type = unref(treeType.value);
    const instance = getTreeInstance(type);
    const res = await getDirTemplate({ categoryId: key, type });
    const { parentNode } = findParentNode(key, type);
    const list = res.map((item: TemplateItem & TreeItem) => {
      const json = JSON.parse(item.options);
      if (Reflect.has(json, 'config') && json.config.version !== 2) {
        item.version = versionEnum.HUIChart;
        item.config = huiChart(json);
        item.name = item.config.name;
      } else if (Reflect.has(json, 'option_template_type')) {
        item.version = versionEnum.PINGChart;
        item.config = pingChart(json);
      } else {
        item.version = versionEnum.PROChart;
        item.config = proChart(json);
        item.name = item.config.title;
      }
      item.icon = iconFilter(item);
      item.isLeaf = true;
      item.key = item.id;
      item.categoryId = key;
      return item;
    });
    if (parentNode.children) {
      parentNode.children.push(...list);
    } else {
      parentNode.children = list;
    }
    instance?.setExpandedKeys(uniq([key, ...instance.getExpandedKeys()]));
  }
  // 启用高亮Hooks
  const [highLightList, { setHighLight, clearHightLight, insertHightListNode }] =
    useHighLight(HIGHTLIGHT);
  function findParentNode(id: number, type?: TemplateType) {
    function fn(): [TreeItem | null, TreeActionType & ComponentRef] {
      return [
        findNode<TreeItem>(treeProps[type || treeType.value].treeData, (item) => item.id === id),
        getTreeInstance(type || treeType.value)!,
      ];
    }
    let [parentNode, instance] = fn();
    if (!parentNode) {
      treeType.value =
        treeType.value === CategoryTreeType.sysTemplate
          ? CategoryTreeType.userTemplate
          : CategoryTreeType.sysTemplate;
      [parentNode, instance] = fn();
    }
    return { parentNode: parentNode!, instance };
  }
  // 搜索列表选中回调
  async function handleSelect(str: string, node: searchItemType) {
    const id = parseInt(str.match(/\[(\d+)\](.+)/i)![1]);
    clearHightLight();
    const { parentNode, instance } = findParentNode(node.categoryId);
    if (parentNode.children && parentNode.children.length > 0) {
      setHighLight(parentNode, id);
    } else {
      await loadData(parentNode.id);
      const path: number[] = findPath(
        treeProps[treeType.value].treeData,
        (item) => item.id === parentNode!.id,
      ).map((path) => path.id);
      instance?.setExpandedKeys(uniq([...path, ...instance.getExpandedKeys()]));
      setHighLight(parentNode, id);
    }
    await nextTick();
    instance.$el
      .getElementsByClassName(HIGHTLIGHT)[0]
      .scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  // 启用树多选Hooks
  const [__, { insertMultiSelectedKey, clearMultiSelected, setTreeData, getMultiList }] =
    useMultiSelect({
      onSingleSelect: ({ dataRef, allowMultiSelect }) => {
        // 仅在单选情况下直接触发选择事件
        const path: string[] = findPath(
          treeProps[treeType.value].treeData,
          (item) => item.id === dataRef.id,
        ).map((path) => path.name);
        if (!allowMultiSelect) {
          emit('selectFolder', dataRef as CategoryTreeModel, path, treeType.value);
        } else {
          emit(
            'selectNode',
            pick(dataRef, ['config', 'id', 'categoryId', 'version']) as TemplateItem,
          );
        }
      },
    });
  // 树节点的选择，支持多选
  function handleTreeSelect(_, e: treeSelectParams) {
    if ((e.node.dataRef as CategoryTreeModel).folder) {
      (e.node.dataRef as CategoryTreeModel).icon = e.node.expanded
        ? 'flat-color-icons:opened-folder'
        : 'flat-color-icons:folder';
    }
    if (
      (e.node.dataRef as CategoryTreeModel).children?.every((item) => item.folder) &&
      e.node.expanded
    ) {
      try {
        // 这是一个异步ajax
        loadData(e.node.eventKey);
      } catch (error) {}
      // return;
    }
    const instance = getTreeInstance(treeType.value);
    // 拿到待操作的树数据
    setTreeData(treeProps[treeType.value].treeData);
    const allowMultiSelect = !isFolder(e.node.dataRef);
    // 执行多选
    insertMultiSelectedKey({ e, allowMultiSelect });
    clearHightLight();
    const list = getMultiList();
    forEach(treeProps[treeType.value].treeData!, (item) => {
      if (list.includes(item.key as number)) {
        insertHightListNode(item);
      }
    });
    instance?.setSelectedKeys(list);
  }
  function copy(str: string) {
    const { isSuccessRef } = useCopyToClipboard(str);
    if (isSuccessRef.value) {
      createMessage.success(t('quota.actionsRes.copyOK'));
    } else {
      createMessage.success(t('quota.actionsRes.copyFailed'));
    }
  }
  function beforeRightClick({
    dataRef,
  }: {
    dataRef: TemplateItem | CategoryTreeModel;
  }): ContextMenuItem[] {
    const list = getMultiList();
    if (!list.includes(dataRef.id)) {
      clearMultiSelected();
      clearHightLight();
    }
    const commonActions: ContextMenuItem[] = [
      {
        label: t('template.actions.copyID'),
        icon: '',
        handler: () => {
          copy(dataRef.id.toString());
        },
      },
      {
        label: t('template.actions.copyName'),
        icon: '',
        handler: () => copy(dataRef.name),
      },
    ];
    const _isFolder = isFolder(dataRef);
    if (_isFolder) {
      return [...commonActions];
    } else {
      return [
        ...commonActions,
        {
          label: t('template.actions.multiSelectQuota'),
          icon: '',
          handler: () => {
            for (let i = 0; i < highLightList.length; i++) {
              const node = highLightList[i];
              // 创建一个宏任务，让数组的watch阶段性触发
              useTimeoutFn(() => {
                emit('selectNode', node as TemplateItem);
              }, 300 * i);
            }
          },
        },
      ];
    }
  }
  onMounted(() => {
    getData(CategoryTreeType.sysTemplate);
    getData(CategoryTreeType.userTemplate);
  });
</script>

<style lang="less" scoped>
  ::v-deep(.ant-tabs .ant-tabs-content-top) {
    height: 100%;

    .ant-tabs-tabpane {
      overflow-y: scroll;
    }
  }

  ::v-deep(.select-hightlight) {
    > .ant-tree-node-content-wrapper {
      background-color: @primary-2 !important;
    }
  }

  .tabs {
    height: calc(100% - 32px);
  }

  .refresh-icon {
    position: absolute;
    top: 90px;
    right: 16px;
    font-size: 20px !important;
    z-index: 9;
  }

  ::v-deep(.ant-input-affix-wrapper) {
    border: none !important;

    &-focused {
      box-shadow: none !important;
      border: none !important;
    }
  }
</style>
