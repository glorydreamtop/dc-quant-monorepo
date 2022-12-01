import { defHttp } from '../http';
import type { TemplateItem } from '/#/template';
import type { CategoryTreeModel } from '/#/quota';
import { CategoryTreeType } from '/@/enums/quotaEnum';
import { getTemplateDataParams, getDirTemplateParams, updateTemplateParams } from './model';

enum Api {
  GetCategoryTree = '/updatemonitor/dict-index/categoryTree',
  GetDirTemplate = '/template/templateByCategory',
  GetTemplate = '/template/templateQuery',
  UpdateTemplate = '/template/templateSaveOrUpdate',
}

export enum searchType {
  sys = 0,
  user = 1,
  all = 2,
}

/**
 * @description: getCategoryTree
 */
export function getTemplateTree(params: {
  type: CategoryTreeType.sysTemplate | CategoryTreeType.userTemplate;
}) {
  return defHttp.get<CategoryTreeModel[]>({
    url: Api.GetCategoryTree,
    params,
  });
}

export function getDirTemplate(params: getDirTemplateParams) {
  return defHttp.get<TemplateItem[]>({
    url: Api.GetDirTemplate,
    params,
  });
}

export function getTemplateData(params: getTemplateDataParams) {
  return defHttp.get<TemplateItem>({
    url: Api.GetTemplate,
    params,
  });
}

export function updateTemplate(params: updateTemplateParams) {
  return defHttp.post({
    url: Api.UpdateTemplate,
    params,
  });
}
