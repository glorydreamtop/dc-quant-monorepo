import { BasicFetchResult } from '../model/baseModel';
import { defHttp, jodiHttp, vesselHttp } from '@dq-next/utils/http';
import { ContentTypeEnum } from '/@/enums/httpEnum';

interface QuotaUpdateGroup {
  id: number;
  indexParam: string;
  indexName: string;
  createUser: number;
  remark: Nullable<string>;
}

enum Api {
  JodiStatDataQuery = '/jodi/stat_data_query',
  JodiOptionsDataList = '/jodi/options_data_list',
  VesselOptionsDataList = '/vessel/options_data_list',
  VesselImportDataQuery = '/vessel/stat_import_export',
  VesselStatDataQuery = '/vessel/stat_data_query',
  VesselUpdateTime = '/vessel/table_update_time',
  SpecialList = '/data-special-info/list',
  SaveOrUpdate = '/data-special-info/saveOrUpdate',
  GetSpecialInfoById = '/data-special-info/getSpecialInfoById',
  SpecialDelete = '/data-special-info/delete',
}

//jodi数据查询
export function getStatDataQuery(params: any) {
  return jodiHttp.request<BasicFetchResult<QuotaUpdateGroup>>({
    url: Api.JodiStatDataQuery,
    method: 'POST',
    params,
  });
}

//jodi菜单栏目录列表
export function getOptionsDataList(params: any) {
  return jodiHttp.request<BasicFetchResult<QuotaUpdateGroup>>({
    url: Api.JodiOptionsDataList,
    method: 'GET',
    params,
  });
}

//船期数据更新时间
export function getVesselUpdateTime() {
  return vesselHttp.request<any>(
    {
      url: Api.VesselUpdateTime,
      method: 'GET',
      headers: {
        'Content-Type': ContentTypeEnum.FORM_URLENCODED,
      },
    },
    {
      isTransformResponse: false,
    },
  );
}

//船期数据（进出口）查询
export function getVesselImportDataQuery(params: any) {
  return vesselHttp.request<BasicFetchResult<QuotaUpdateGroup>>(
    {
      url: Api.VesselImportDataQuery,
      method: 'POST',
      params,
      headers: {
        'Content-Type': ContentTypeEnum.FORM_URLENCODED,
      },
    },
    {
      isTransformResponse: false,
    },
  );
}

//船期数据（报表）查询
export function getVesselStatDataQuery(params: any) {
  return vesselHttp.request<BasicFetchResult<QuotaUpdateGroup>>(
    {
      url: Api.VesselStatDataQuery,
      method: 'POST',
      params,
      headers: {
        'Content-Type': ContentTypeEnum.FORM_URLENCODED,
      },
    },
    {
      isTransformResponse: false,
    },
  );
}

//船期菜单栏目录列表
export function getVesselOptionsDataList(params: any, key: string) {
  return vesselHttp.request<BasicFetchResult<QuotaUpdateGroup>>(
    {
      url: Api.VesselOptionsDataList + '?column=' + key,
      method: 'POST',
      params,
      headers: {
        'Content-Type': ContentTypeEnum.FORM_URLENCODED,
      },
    },
    {
      isTransformResponse: false,
    },
  );
}

//专项数据列表
export function getSpecialList(params: any) {
  return defHttp.request({
    url: Api.SpecialList,
    method: 'GET',
    params,
  });
}

//保存/编辑专项
export function postSaveOrUpdate(params: any) {
  return defHttp.request({
    url: Api.SaveOrUpdate,
    method: 'POST',
    params,
  });
}

//专项数据详情
export function getSpecialInfoById(params: any) {
  return defHttp.request({
    url: Api.GetSpecialInfoById,
    method: 'GET',
    params,
  });
}

//专项数据删除
export function SpecialDelete(params: any) {
  return defHttp.request({
    url: Api.SpecialDelete,
    method: 'GET',
    params,
  });
}
