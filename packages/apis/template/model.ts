import { CategoryTreeType } from '/@/enums/quotaEnum';

export interface getTemplateDataParams {
  id: number;
}

export interface updateTemplateParams {
  id?: number;
  template: string;
  type: CategoryTreeType.sysTemplate | CategoryTreeType.userTemplate;
}

export interface getDirTemplateParams {
  categoryId: number;
  type: CategoryTreeType.sysTemplate | CategoryTreeType.userTemplate;
}
