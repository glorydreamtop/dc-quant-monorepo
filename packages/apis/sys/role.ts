import { defHttp } from '@dq-next/utils/http';

import { RoleItem } from './model';
import { ResultEnum } from '/@/enums/httpEnum';
import { BasicFetchResult, BasicPageParams } from '../model/baseModel';

enum Api {
  GetRoleList = '/sys/role/list',
  SaveRole = '/sys/role/save',
  UpdateRole = '/sys/role/update',
  DelRole = '/sys/role/delete',
}

/**
 * @description: Get user role based on id
 */
export function getRoleListById(params?: BasicPageParams) {
  return defHttp.request<BasicFetchResult<RoleItem>>({
    url: Api.GetRoleList,
    method: 'GET',
    params,
  });
}

/**
 * @description: Update user role based on id
 */
export function updateRole(params?: RoleItem) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.UpdateRole,
    method: 'POST',
    params,
  });
}

/**
 * @description: Save user role based on id
 */
export function saveRole(params?: RoleItem) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.SaveRole,
    method: 'POST',
    params,
  });
}

/**
 * @description: Del user role based on id
 */
export function delRole(params?: number[]) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.DelRole,
    method: 'POST',
    params,
  });
}
