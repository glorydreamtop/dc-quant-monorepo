import { defHttp } from '@dq-next/utils/http';
import { LoginParams, LoginResultModel } from './model';
import { ErrorMessageMode } from '/#/axios';
import { BasicFetchResult, BasicPageParams, IdModel } from '../model/baseModel';
import { ResultEnum } from '/@/enums/httpEnum';
import { UserInfo } from '/#/store';

enum Api {
  Login = '/sys/login',
  GetUserInfoById = '/sys/user/info',
  GetUserList = '/sys/user/list',
  SaveUserList = '/sys/user/save',
  UpdateUserList = '/sys/user/update',
  DelUserList = '/sys/user/delete',
  CheckName = '/sys/user/checkName',
  SendVerifyCode = '/smsVerifyCode',
  SavePhone = '/sys/user/changePhoneNum',
  SavePwd = '/sys/user/password',
  FindPwd = '/findPwd',
  GetBingWallpaper = 'https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN',
  generateToken = '/sys-user-api-token/generateToken',
  queryUserToken = '/sys-user-api-token/queryUserToken',
  infoAdmin = '/sys/user/infoAdmin/',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.request<LoginResultModel>(
    {
      url: Api.Login,
      method: 'POST',
      params,
    },
    {
      errorMessageMode: mode,
      isTransformResponse: false,
    },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo(params?: IdModel) {
  return defHttp.request<UserInfo>({
    url: params ? `${Api.GetUserInfoById}/${params.id}` : Api.GetUserInfoById,
    method: 'GET',
    params,
  });
}

/**
 * @description: getUserList
 */
export function getUserList(params?: BasicPageParams<Partial<UserInfo>>) {
  return defHttp.request<BasicFetchResult<UserInfo>>({
    url: Api.GetUserList,
    method: 'GET',
    params,
  });
}

/**
 * @description: saveUserInfo
 */
export function saveUserInfo(params: UserInfo) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.SaveUserList,
    method: 'POST',
    params,
  });
}

/**
 * @description: updateUserInfo
 */
export function updateUserInfo(params: Partial<UserInfo>) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.UpdateUserList,
    method: 'POST',
    params,
  });
}

/**
 * @description: delUserInfo
 */
export function delUserInfo(params: number[]) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.DelUserList,
    method: 'POST',
    params,
  });
}

export function checkName(params: { name: string }) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.CheckName,
    method: 'GET',
    params,
  });
}

export function sendVerifyCode(params: { phoneNum: string }) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.SendVerifyCode,
    method: 'GET',
    params,
  });
}

export function saveUserPhone(params: { phoneNum: string; verifyCode: string }) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.SavePhone,
    method: 'GET',
    params,
  });
}

export function saveUserPwd(params: {
  newPassword: string;
  password: string;
  smsVerifyCode: string;
}) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.SavePwd,
    method: 'POST',
    params,
  });
}

export function findPwd(params: { phoneNum: string; password: string; smsVerifyCode: string }) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.FindPwd,
    method: 'POST',
    params,
  });
}

//生成ApiToken
export function generateToken() {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.generateToken,
    method: 'GET',
  });
}

//获取当前登录用户ApiToken
export function queryUserToken() {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.queryUserToken,
    method: 'GET',
  });
}

//login as:用户信息(仅管理员可用)
export function infoAdmin(params: string) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.infoAdmin + params,
    method: 'GET',
  });
}

export function testRetry() {
  return defHttp.get(
    { url: Api.TestRetry },
    {
      retryRequest: {
        isOpenRetry: true,
        count: 5,
        waitTime: 1000,
      },
    },
  );
}
