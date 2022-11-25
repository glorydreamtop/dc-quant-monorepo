import { CSSProperties } from 'vue';
import { chartConfigType } from './chart';
import { versionEnum } from '/@/enums/chartEnum';
import { CategoryTreeType } from '/@/enums/quotaEnum';

/**
 * @param template 由 {config,category_id} 对象stringify得到
 */
export interface TemplateApiNeed {
  type: CategoryTreeType.sysTemplate | CategoryTreeType.userTemplate;
  template: string;
  temolate_name: string;
  id?: number;
}

export interface TemplateItem {
  [key: string]: any;
  version: versionEnum;
  config: chartConfigType;
  categoryId: number;
  id: number;
}

export interface TemplateDOM {
  [key: string]: any;
  type: 'Chart' | 'Table' | 'Text' | 'Img';
  version?: versionEnum;
  config: tempConfigs;
  categoryId?: number;
  id?: number;
  uniqId: string;
  pageConfig: CSSProperties;
}

export interface TextConfig {
  text: string;
}

export interface ImgConfig {
  url: string;
  mode: string;
}

export interface pageSettingType {
  pageType?: string;
  pagination: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  horizontal: boolean;
  header: {
    show: boolean;
    left: string;
    center: string;
    right: string;
  };
  footer: {
    show: true;
    left: string;
    center: string;
    right: string;
    pageNum: boolean;
  };
  showElementborder: boolean;
  scale: number;
}

export type tempConfigs = chartConfigType | TextConfig | ImgConfig;
