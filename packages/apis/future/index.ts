import { defHttp, monitorHttp } from '../http';

import { RankParams, RankResult, SearchProductOrContractParams, tableData } from './model';

enum Api {
  GetFutureRankList = '/future-rank/getVolumeRank', //持仓排名列表
  GetSearchInfoList = '/future-rank/searchInfoList', //模糊搜索(按品种或合约)
  GetProOrConValidDate = '/future-rank/getProOrConValidDate', //查询品种/合约有效日期
  GetHoldShares = '/future-rank/getHoldShares', //会员指定品种持仓
  GetBuildShares = '/future-rank/getBuildShares', //会员指定品种建仓过程
  GetExchangeList = '/future-rank/getExchangeList', //查询交易所列表
  GetHoldSharesAnalyse = '/future-rank/getHoldSharesAnalyse', //查询会员持仓分析
  GetMemberHoldSharesWorth = '/future-rank/getMemberHoldSharesWorth', //查询会员持仓分析(金额)
  GetSearchMemberList = '/future-rank/searchMemberList', //查询会员列表
  GetMemberValidDate = '/future-rank/getMemberValidDate', //查询会员有效日期
  GetIndexByProduct = '/category/getIndexByProduct', //根据品种查询指标

  //相对强弱
  GetTableTimeSeries = '/service/tablequery/table_series',

  //横向监控
  GetCtypeOptions = '/ctype_options', //链条名称列表
  GetDtOptions = '/dt_options', //合法日期列表
  GetCompareOptions = '/ctype_compare', //获取数据
  GetCommStructure = '/comm_structure', //弹窗数据
}

export function getFutureRankList(params: RankParams) {
  return defHttp.request<RankResult>({
    url: Api.GetFutureRankList,
    method: 'GET',
    params,
  });
}

export function getSearchInfoList(params: { type: number; key: string }) {
  return defHttp.request<SearchProductOrContractParams[] | string[]>({
    url: Api.GetSearchInfoList,
    method: 'GET',
    params,
  });
}

export function getProOrConValidDate(params: { contract?: string; productId?: string }) {
  return defHttp.request<string[]>({
    url: Api.GetProOrConValidDate,
    method: 'GET',
    params,
  });
}

export function getHoldShares(params: {
  contract?: string;
  productId?: string;
  memberName: string;
  tradeDate: string;
}) {
  return defHttp.request<RankResult>({
    url: Api.GetHoldShares,
    method: 'GET',
    params,
  });
}

export function getBuildShares(params: {
  productId?: string;
  memberName: string;
  rankType: number;
}) {
  return defHttp.request<RankResult>({
    url: Api.GetBuildShares,
    method: 'GET',
    params,
  });
}

export function getExchangeList() {
  return defHttp.request<{ [key: string]: string }>({
    url: Api.GetExchangeList,
    method: 'GET',
  });
}

export function getHoldSharesAnalyse(params: {
  memberName: string;
  exchange: string;
  tradeDate: string;
}) {
  return defHttp.request<RankResult>({
    url: Api.GetHoldSharesAnalyse,
    method: 'GET',
    params,
  });
}

export function getMemberHoldSharesWorth(params: {
  memberName: string;
  exchange: string;
  tradeDate: string;
}) {
  return defHttp.request<RankResult>({
    url: Api.GetMemberHoldSharesWorth,
    method: 'GET',
    params,
  });
}

export function getSearchMemberList() {
  return defHttp.request<string[]>({
    url: Api.GetSearchMemberList,
    method: 'GET',
  });
}

export function getMemberValidDate(params: { memberName: string; exchange: string }) {
  return defHttp.request<string[]>({
    url: Api.GetMemberValidDate,
    method: 'GET',
    params,
  });
}

export function getIndexByProduct(params: any) {
  return defHttp.request<RankResult[]>({
    url: Api.GetIndexByProduct,
    method: 'GET',
    params,
  });
}

export function getTableTimeSeries(params: {
  database: string;
  valueColumn: string;
  end?: string;
  start?: string;
  options?: string;
  dateColumn: string;
  tableName: string;
}) {
  return defHttp.request<tableData[]>({
    url: Api.GetTableTimeSeries,
    method: 'GET',
    params,
  });
}

export function getCtypeOptions() {
  return monitorHttp.request<any>({
    url: Api.GetCtypeOptions,
    method: 'GET',
  });
}

export function getDtOptions(params: any) {
  return monitorHttp.request<any>({
    url: Api.GetDtOptions,
    method: 'GET',
    params,
  });
}

export async function getCompareOptions(params: any) {
  interface json {
    [key: string]: any[] | undefined;
  }
  const res = await monitorHttp.request<any>({
    url: Api.GetCompareOptions,
    method: 'GET',
    params,
  });
  const json: json = {
    table: undefined,
    yoy: undefined,
  };
  for (const key in res) {
    if (Object.prototype.hasOwnProperty.call(res, key)) {
      const str = res[key];
      json[key] = JSON.parse(str);
    }
  }
  return json;
}

export function getCommStructure(params: any) {
  return monitorHttp.request<any>({
    url: Api.GetCommStructure,
    method: 'GET',
    params,
  });
}
