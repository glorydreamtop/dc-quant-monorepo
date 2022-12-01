import { defHttp } from '../http';
import { MenuListResultModel } from './model/menuModel';

enum Api {
  GetMenuList = '/sys/menu/nav',
}

/**
 * @description: Get user menu based on id
 */

export function getMenuList() {
  return defHttp.get<MenuListResultModel>({ url: Api.GetMenuList });
}
