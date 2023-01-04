import { sourceTypeEnum } from '/@/enums/quotaEnum';
import { DateUtil } from '@dq-next/utils/dateUtil';

export interface CategoryTreeModel {
  folder: boolean;
  code: string;
  children?: CategoryTreeModel[];
  lazy: boolean;
  sorting: number;
  name: string;
  description: Nullable<string>;
  id: number;
  type: 'DictCategory';
  key: number;
  parentId: Nullable<number>;
  isLeaf?: boolean;
  slots?: { [x: string]: any };
  icon?: 'flat-color-icons:opened-folder' | 'flat-color-icons:folder' | 'flat-color-icons:file';
}

export interface QuotaItem {
  id: number | string;
  dateLast?: string;
  name: string;
  sourceCode: string;
  sourceType: sourceTypeEnum;
  frequency?: Nullable<'日' | '月' | '年' | '周' | '季'>;
  shortName?: Nullable<string>;
  unit?: Nullable<string>;
  categoryIdList?: number[];
  categoryId?: number;
  timeLastUpdate?: string;
  range?: [string, string];
}

export interface SelectedQuotaItem extends QuotaItem {
  selected: boolean;
}
