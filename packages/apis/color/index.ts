import { defHttp } from '../http';

import { ColorsSchemeModel } from './model';
import { ResultEnum } from '/@/enums/httpEnum';
import { BasicFetchResult, BasicPageParams, BasicIdParams } from '../model/baseModel';

enum Api {
  GetAllColorScheme = '/sys/colors/list',
  GetColorScheme = '/sys/colors/info',
  SetColorScheme = '/sys/colors/save',
  DelColorScheme = '/sys/colors/delete',
  UpdateColorScheme = '/sys/colors/update',
}

/**
 * @description: Get all colorScheme
 */
export function getAllColorScheme(params?: BasicPageParams) {
  return defHttp.request<BasicFetchResult<ColorsSchemeModel>>({
    url: Api.GetAllColorScheme,
    method: 'GET',
    params,
  });
}

/**
 * @description: Set a colorScheme
 */
export function setColorScheme(params: ColorsSchemeModel) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.SetColorScheme,
    method: 'POST',
    params,
  });
}

/**
 * @description: Delete a colorScheme
 */
export function delColorScheme(params: number[]) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.DelColorScheme,
    method: 'POST',
    params,
  });
}

/**
 * @description: Update a colorScheme
 */
export function updateColorScheme(params: BasicIdParams<ColorsSchemeModel>) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.UpdateColorScheme,
    method: 'POST',
    params,
  });
}

export function getColorScheme(params: { id: number }) {
  return defHttp.request<ColorsSchemeModel>({
    url: `${Api.GetColorScheme}/${params.id}`,
    method: 'GET',
  });
}
