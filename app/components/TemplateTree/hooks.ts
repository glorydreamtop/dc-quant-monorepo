import { cloneDeep, remove } from 'lodash-es';
import { TreeItem } from '../Tree';
import { findNode } from '@dq-next/utils/helper/treeHelper';
import type {
  multiSelectHooksParams,
  insertMultiSelectHooksParams,
  hightlightHooksType,
  multiSelectHooksType,
  treeSelectParams,
} from './types';
import { versionEnum } from '/@/enums/chartEnum';
import { TemplateItem } from '/#/template';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

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
        (node) => node.id === (dataRef as TemplateItem).categoryId,
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
      clearMultiSelected();
      multiSelectedList.push(eventKey);
      singleSelectFn && singleSelectFn({ dataRef, allowMultiSelect });
    }
  }

  return [
    multiSelectedList,
    { insertMultiSelectedKey, setTreeData, clearMultiSelected, getMultiList },
  ];
}

export function useTemplateVersion() {
  const templateNameVersion = {
    [versionEnum.HUIChart]: (item) => item.name,
    [versionEnum.PROChart]: (item) => item.name,
    [versionEnum.PINGChart]: (item) => `[${t('template.compatible')}]${item.name}`,
  };
  function getTemplateName(item: TemplateItem) {
    return templateNameVersion[item.version].call(null, item);
  }
  const templateIconVersion = {
    [versionEnum.HUIChart]: 'ant-design:line-chart-outlined',
    [versionEnum.PINGChart]: 'ant-design:area-chart-outlined',
    [versionEnum.PROChart]: 'mdi:chart-areaspline',
  };
  function getTemplateIcon(item: TemplateItem) {
    return templateIconVersion[item.version];
  }
  return { getTemplateIcon, getTemplateName };
}
