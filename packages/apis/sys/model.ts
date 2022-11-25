import { ResultEnum } from '/@/enums/httpEnum';

/********** Menu **********/
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

/********** User **********/

export interface LoginParams {
  username: string;
  password: string;
  captcha: string;
  uuid: string;
}

export interface LoginResultModel {
  token: string;
  msg: string;
  code: Exclude<ResultEnum, ResultEnum.TYPE>;
}

/********** Role **********/

export interface RoleItem {
  roleId: number;
  roleName: string;
  remark?: string;
  createUserId: number;
  menuIdList: number[];
  createTime: string;
}

/********** UploadApi **********/

export interface UploadApiResult {
  flag: boolean;
  code: number;
  info: string[];
}
