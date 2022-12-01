import { defHttp } from '../http';
import type { CategoryTreeModel, QuotaItem } from '/#/quota';
import { CategoryTreeType, SourceTypeEnum } from '/@/enums/quotaEnum';
import {
  getQuotaDataParams,
  getQuotaDataResult,
  importJsonParams,
  requestUpdateParams,
} from './model';
import { pick } from 'lodash-es';
import { ContentTypeEnum, ResultEnum } from '/@/enums/httpEnum';

enum Api {
  GetCategoryTree = '/updatemonitor/dict-index/categoryTree',
  UpdateCategoryTree = '/updatemonitor/dict-index/categorySaveOrUpdate',
  DelCategoryTree = '/updatemonitor/dict-index/categoryDelete',
  GetDirQuota = '/index/index',
  SearchQuota = '/updatemonitor/dict-index/searchIndex',
  GetQuotaData = '/updatemonitor/dict-index/exportData',
  GetQuotaInfo = '/updatemonitor/dict-index/queryDictIndex',
  RequestUpdateQuotaData = '/dataUpdater/updateIndex',
  MoveQuota = '/category/indexMove',
  SortQuota = '/category/categorySorting',
  UpdateCategory = '/updatemonitor/dict-index/categorySaveOrUpdate',
  SaveQuota = '/updatemonitor/dict-index/saveOrUpdateDictIndex',
  DelQuota = '/updatemonitor/dict-index/deleteDictIndex',
  DelQuotaData = '/updatemonitor/dict-index/deleteDictIndexData',
  ImportQuotaData = '/updatemonitor/dict-index/importJson',
  NOCSearch = '/updatemonitor/dict-index/getNoCategoryIndex',
}

export enum searchType {
  sys = 0,
  user = 1,
  all = 2,
}

export enum quotaDataExportTypeEnum {
  JSON = '0',
  XLSX = '1',
  CSV = '2',
}

export enum quotaDataPastUnitTypeEnum {
  day = '日',
  last = '期',
  month = '月',
}

/**
 * @description: getCategoryTree
 */
export function getQuotaTree(params: {
  type: CategoryTreeType.sysQuota | CategoryTreeType.userQuota | CategoryTreeType.product;
}) {
  return defHttp.get<CategoryTreeModel[]>({
    url: Api.GetCategoryTree,
    params,
  });
}

export function getDirQuota(params: { categoryId: number }) {
  return defHttp.get<QuotaItem[]>({
    url: Api.GetDirQuota,
    params,
  });
}

export function searchQuota(params: {
  flag?: searchType;
  key?: string;
  sourceType?: SourceTypeEnum;
  idRange?: string;
}) {
  if (!params.flag) params.flag = searchType.all;
  return defHttp.get<QuotaItem[]>({
    url: Api.SearchQuota,
    params,
  });
}

export function getNOCQuota(params: { key: string; currPage: number; pageSize: number }) {
  return defHttp.request<{ totalCount: number; list: QuotaItem[] }>({
    url: Api.NOCSearch,
    method: 'GET',
    params,
  });
}

export function getQuotaData(params: getQuotaDataParams) {
  if (params.pastValue === 0) {
    Reflect.deleteProperty(params, 'pastValue');
    Reflect.deleteProperty(params, 'pastUnit');
  }
  const rows = params.rows.map((item) => {
    // 临时公式不发送id
    return pick(item, [
      'sourceCode',
      'name',
      'sourceType',
      item.id ? (/formula/i.test(item.id.toString()) ? '' : 'id') : '',
    ]);
  });
  return defHttp.post<getQuotaDataResult[]>(
    {
      url: Api.GetQuotaData,
      responseType: params.exportPara !== quotaDataExportTypeEnum.JSON ? 'arraybuffer' : 'json',
      params: {
        ...params,
        rows,
      },
    },
    {
      isReturnNativeResponse: params.exportPara !== quotaDataExportTypeEnum.JSON,
    },
  );
}

export function getSingleQuotaData({ id, date }: { id: number; date: string }) {
  const rows = [{ id }];
  return defHttp.post<getQuotaDataResult[]>({
    url: Api.GetQuotaData,
    params: {
      endDate: date,
      lastFlag: true,
      rows,
    },
  });
}

export function getQuotaInfo(params: { indexId: number }) {
  return defHttp.request<QuotaItem[]>({
    url: Api.GetQuotaInfo,
    method: 'GET',
    params,
  });
}

export function requestUpdateQuotaData(params: requestUpdateParams) {
  return defHttp.post<ResultEnum.TYPE>(
    {
      url: Api.RequestUpdateQuotaData,
      params,
    },
    {
      isTransformResponse: false,
    },
  );
}

export function moveQuota(params: requestUpdateParams) {
  return defHttp.post<ResultEnum.TYPE>({
    url: Api.MoveQuota,
    params,
  });
}

export function sortQuota(params: {
  type: CategoryTreeType;
  categorySortingList: { id: number; sorting: number }[];
}) {
  const types = {
    [CategoryTreeType.sysQuota]: 1,
    [CategoryTreeType.userQuota]: 1,
    [CategoryTreeType.sysTemplate]: 2,
    [CategoryTreeType.userTemplate]: 2,
    [CategoryTreeType.folder]: 0,
  };
  params.type = types[params.type];
  return defHttp.post<ResultEnum.TYPE>({
    url: Api.SortQuota,
    params,
  });
}

export function updateCategory(params: {
  id?: number;
  name: string;
  parentId: number;
  type?: CategoryTreeType;
}) {
  return defHttp.post<ResultEnum.TYPE>({
    url: Api.UpdateCategory,
    params,
  });
}

export function delCategory(params: { id: number }) {
  return defHttp.get<ResultEnum.TYPE>({
    url: Api.DelCategoryTree,
    params,
  });
}

export function saveQuota(params: Partial<QuotaItem>) {
  return defHttp.post<ResultEnum.TYPE>({
    url: Api.SaveQuota,
    params,
  });
}

export function delQuota(params: { indexId: number }) {
  return defHttp.get<ResultEnum.TYPE>({
    url: Api.DelQuota,
    params,
  });
}

export function importJson(params: importJsonParams) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.ImportQuotaData,
    method: 'POST',
    params,
    headers: {
      'Content-Type': ContentTypeEnum.FORM_URLENCODED,
    },
  });
}

export function delQuotaData(params: {
  indexId?: number;
  indexList?: string;
  startDate: string;
  endDate: string;
}) {
  return defHttp.get<ResultEnum.TYPE>({
    url: Api.DelQuotaData,
    params,
  });
}
