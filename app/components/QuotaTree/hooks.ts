import { cloneDeep, remove } from 'lodash-es';
import { TreeItem } from '../Tree';
import { CategoryTreeModel, QuotaItem } from '/#/quota';
import { findNode } from '@dq-next/utils/helper/treeHelper';
import type {
  multiSelectHooksParams,
  insertMultiSelectHooksParams,
  hightlightHooksType,
  multiSelectHooksType,
  treeSelectParams,
  treePropsModel,
} from './types';
import { Ref } from 'vue';
import { updateCategory, delCategory as delCategoryById } from '@dq-next/http-apis/quota';
import { CategoryTreeType } from '/@/enums/quotaEnum';
import mitt from '@dq-next/utils/mitt';

export function useHighLight(HIGHTLIGHT: string): hightlightHooksType {
  const hightlightList: TreeItem[] = [];
  function setHighLight(parentNode: TreeItem, id: number) {
    const node = parentNode.children!.find((item) => {
      Reflect.deleteProperty(item, 'class');
      return item.id === id;
    })!;
    node.class = HIGHTLIGHT;
    hightlightList.push(node);
  }
  function clearHightLight() {
    hightlightList.forEach((item) => {
      Reflect.deleteProperty(item, 'class');
    });
    remove(hightlightList, (_) => _);
  }
  function insertHightListNode(node: TreeItem) {
    node.class = HIGHTLIGHT;
    hightlightList.push(node);
  }
  return [hightlightList, { setHighLight, clearHightLight, insertHightListNode }];
}

export function useMultiSelect({ onSingleSelect }: multiSelectHooksParams): multiSelectHooksType {
  const multiSelectedList: number[] = [];
  let treeData: TreeItem;
  const singleSelectFn = onSingleSelect;
  function setTreeData(tree: TreeItem) {
    treeData = tree;
  }
  function clearMultiSelected() {
    remove(multiSelectedList, (_) => _);
  }
  function getMultiList() {
    return cloneDeep(multiSelectedList);
  }
  function insertMultiSelectedKey({
    e: {
      nativeEvent,
      node: { eventKey, dataRef },
    },
    allowMultiSelect,
  }: insertMultiSelectHooksParams<treeSelectParams>) {
    const oldList = cloneDeep(multiSelectedList);
    if (nativeEvent.ctrlKey && allowMultiSelect) {
      // Ctrl多选
      const index = oldList.indexOf(eventKey);
      if (index > -1) {
        multiSelectedList.splice(index, 1);
      } else {
        multiSelectedList.push(eventKey);
      }
    } else if (nativeEvent.shiftKey && allowMultiSelect) {
      // Shift多选
      let minIndex = 999;
      let maxIndex = 0;
      const list = findNode<TreeItem>(
        treeData!,
        (node) => node.id === (dataRef as QuotaItem).categoryId,
      )!.children!;
      for (let i = 0; i < multiSelectedList.length; i++) {
        minIndex = Math.min(
          list.findIndex((item) => item.key === multiSelectedList[i]),
          minIndex,
        );
        maxIndex = Math.max(
          list.findIndex((item) => item.key === multiSelectedList[i]),
          maxIndex,
        );
      }
      const currentIndex = list.findIndex((item) => item.key === eventKey);
      if (currentIndex < minIndex) {
        minIndex = currentIndex;
      }
      if (currentIndex > maxIndex) {
        maxIndex = currentIndex;
      }
      for (let index = minIndex; index <= maxIndex; index++) {
        const key = list[index].key as number;
        if (multiSelectedList.indexOf(key) === -1) {
          multiSelectedList.push(key);
        }
      }
    } else {
      singleSelectFn && singleSelectFn({ dataRef, allowMultiSelect });
      clearMultiSelected();
      multiSelectedList.push(eventKey);
    }
  }

  return [
    multiSelectedList,
    { insertMultiSelectedKey, setTreeData, clearMultiSelected, getMultiList },
  ];
}

export function useTreeCURD({
  tree,
  treeType,
}: {
  tree: treePropsModel;
  treeType: Ref<CategoryTreeType>;
}) {
  function addFolder(folder: CategoryTreeModel) {
    const key = 0;
    const node: CategoryTreeModel = {
      slots: { title: 'title' },
      name: '新建文件夹',
      folder: true,
      icon: 'flat-color-icons:folder',
      id: key,
      isLeaf: false,
      key: key,
      parentId: folder.id,
    };
    tree[treeType.value].treeInstance.insertNodeByKey({
      parentKey: folder.id,
      node,
      push: 'unshift',
    });
    // 新增子目录时展开该目录
    const expandKeys: number[] = tree[treeType.value].treeInstance.getExpandedKeys();
    if (!expandKeys.includes(folder.id)) {
      tree[treeType.value].treeInstance.setExpandedKeys([...expandKeys, folder.id]);
    }
  }
  async function saveCategory(folder: CategoryTreeModel) {
    await updateCategory({
      parentId: folder.parentId!,
      name: folder.name,
      id: folder.id !== 0 ? folder.id : undefined,
      type: treeType.value,
    });
  }
  async function delCategory(folder: CategoryTreeModel) {
    await delCategoryById({ id: folder.id });
  }
  return { addFolder, saveCategory, delCategory };
}

export const emitter = mitt();
