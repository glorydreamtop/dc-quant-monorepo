/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  username: string;
  password: string;
}

export interface RoleInfo {
  roleName: string;
  value: string;
}

export type RoleIdList = number[];

/**
 * @description: Login interface return value
 */
export interface LoginResultModel {
  userId: string | number;
  token: string;
  role: RoleInfo;
}

/**
 * @description: Get user information return value
 */
export interface GetUserInfoModel {
  roleIdList: RoleIdList;
  // 用户id
  userId: string | number;
  // 用户名
  username: string;
  // 头像
  avatar: string;
  // 邮箱
  email?: string;
  // 手机号码
  mobile?: string;
}
