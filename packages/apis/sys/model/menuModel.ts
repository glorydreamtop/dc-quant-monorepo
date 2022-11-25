import type { RouteMeta } from 'vue-router';
export interface RouteItem {
  path: string;
  component: any;
  meta: RouteMeta;
  name?: string;
  alias?: string | string[];
  redirect?: string;
  caseSensitive?: boolean;
  children?: RouteItem[];
}

/**
 * @description: Get menu return value
 */
export interface MenuItem {
  icon: string;
  menuId: number;
  name: string;
  open: false;
  orderNum: number;
  parentId: number;
  parentName: string;
  perms: string;
  type: number;
  url: string;
  list: MenuItem[] | null;
}

export interface MenuListResultModel {
  menuList: MenuItem[];
  permissions: string[];
}
