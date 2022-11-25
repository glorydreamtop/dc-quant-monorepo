import type { ContextMenuItem, ReplaceFields, TreeItem, TreeActionType } from '../Tree';
import type { CategoryTreeModel, QuotaItem } from '/#/quota';
import { CategoryTreeType } from '/@/enums/quotaEnum';
import { ComputedRef } from 'vue';

export type hightlightHooksType = [
  TreeItem[],
  { setHighLight: Fn; clearHightLight: Fn; insertHightListNode: Fn },
];

export interface treeSelectParams {
  nativeEvent: PointerEvent;
  node: { eventKey: number; dataRef: QuotaItem | CategoryTreeModel; expanded: boolean };
}
export interface insertMultiSelectHooksParams<T = treeSelectParams> {
  e: T;
  allowMultiSelect: boolean;
}

export type multiSelectHooksType = [
  number[],
  {
    insertMultiSelectedKey: Fn;
    setTreeData: Fn;
    clearMultiSelected: Fn;
    getMultiList: () => number[];
  },
];

export interface multiSelectHooksParams {
  onSingleSelect?: ({}: {
    dataRef: QuotaItem | CategoryTreeModel;
    allowMultiSelect: boolean;
  }) => void;
}

export type treeProp = Partial<{
  treeData: CategoryTreeModel[];
  fieldNames: ReplaceFields;
  blockNode: boolean;
  clickRowToExpand: boolean;
  loadData: Fn;
  rightMenuList: ContextMenuItem[];
  treeInstance: ComputedRef<TreeActionType & ComponentRef>;
  showLine: boolean;
}>;
export interface treePropsModel {
  [CategoryTreeType.sysQuota]: treeProp;
  [CategoryTreeType.userQuota]: treeProp;
}
export interface searchItemType {
  label: string;
  value: any;
  categoryId: number;
}
export type QuotaType = CategoryTreeType.sysQuota | CategoryTreeType.userQuota;
