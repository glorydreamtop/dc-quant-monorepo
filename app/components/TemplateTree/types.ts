import type { ContextMenuItem, ReplaceFields, TreeItem } from '../Tree';
import type { CategoryTreeModel } from '/#/quota';
import type { TemplateItem } from '/#/template';
import { CategoryTreeType } from '/@/enums/quotaEnum';

export type hightlightHooksType = [
  TreeItem[],
  { setHighLight: Fn; clearHightLight: Fn; insertHightListNode: Fn },
];

export interface treeSelectParams {
  nativeEvent: PointerEvent;
  node: { eventKey: number; dataRef: TemplateItem | CategoryTreeModel };
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
    dataRef: TemplateItem | CategoryTreeModel;
    allowMultiSelect: boolean;
  }) => void;
}

export type treeProp = Partial<{
  treeData: TreeItem[];
  fieldNames: ReplaceFields;
  blockNode: boolean;
  clickRowToExpand: boolean;
  loadData: Fn;
  rightMenuList: ContextMenuItem[];
}>;
export interface treePropsModel {
  [CategoryTreeType.sysTemplate]: treeProp;
  [CategoryTreeType.userTemplate]: treeProp;
}
export interface searchItemType {
  label: string;
  value: any;
  categoryId: number;
}
export type TemplateType = CategoryTreeType.sysTemplate | CategoryTreeType.userTemplate;
