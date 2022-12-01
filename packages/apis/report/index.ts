import { defHttp, nodeHttp } from '../http';

import { ContentTypeEnum, ResultEnum } from '/@/enums/httpEnum';
import { TreeType } from '/@/enums/quotaEnum';
import { BasicPageParams, IdModel } from '../model/baseModel';

enum Api {
  DelTemplate = '/template/templateDelete',
  SaveTemplate = '/template/templateSaveOrUpdate',
  UpdateDir = '/updatemonitor/dict-index/categorySaveOrUpdate',
  DelDir = '/updatemonitor/dict-index/categoryDelete',
  GetTemplateData = '/template/templateQuery',
  SaveReportTemplate = '/duquantbusinessupdatemonitor/data-report-info/saveOrUpdate',
  GetReportTemplateList = '/duquantbusinessupdatemonitor/data-report-info/list',
  DelReportTemplate = '/duquantbusinessupdatemonitor/data-report-info/delete',
  GetReportById = '/duquantbusinessupdatemonitor/data-report-info/getReportById',
  PublishReport = '/duquantbusinessupdatemonitor/data-report-info/publishReport',
  CategoryTree = '/updatemonitor/dict-index/categoryTree',
  GetTemplate = '/template/templateByCategory',
  Report2PDF = '/report/report2PDF',
}

/**
 * @description: Get all user template
 */
export function getAllTemplate(params: GetTemplateListParams) {
  return defHttp.request<TemplateItem[]>({
    url: Api.CategoryTree,
    method: 'GET',
    params,
  });
}

/**
 * @description: Save user Template
 */
export function saveTemplate(params: SaveTemplateParams) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.SaveTemplate,
    method: 'POST',
    params,
  });
}

/**
 * @description: Del user Template based on id
 */
export function delTemplate(params: { id: number }) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.DelTemplate,
    method: 'GET',
    params,
  });
}

/**
 * @description: UpdateTemplateDir
 */
export function updateTemplateDir(params: TemplateDir) {
  return defHttp.request<{ id: number }>({
    url: Api.UpdateDir,
    method: 'POST',
    params,
  });
}

/**
 * @description: delTemplateDir
 */
export function delTemplateDir(params: { id: number }) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.DelDir,
    method: 'POST',
    params,
  });
}

/**
 * @description: Get user template
 */
export function getTemplates(params: { categoryId: number; type: TreeType }) {
  return defHttp.request<TemplateItem[]>({
    url: Api.GetTemplate,
    method: 'GET',
    params,
  });
}

/**
 * @description: 获取图表模板数据
 */
export function getTemplateData(params: { id: number }) {
  return defHttp.request<{ options: string }>({
    url: Api.GetTemplateData,
    method: 'GET',
    params,
  });
}

/**
 * @description: 保存报告模板
 */
export function SaveReportTemplate(params) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.SaveReportTemplate,
    method: 'POST',
    params,
    headers: {
      'Content-Type': ContentTypeEnum.JSON,
    },
  });
}

interface reportListParams {
  productId?: number;
}

/**
 * @description: 获取报告列表
 */
export function getReportList(params: BasicPageParams<reportListParams>) {
  return defHttp.request({
    url: Api.GetReportTemplateList,
    method: 'GET',
    params: {
      ...params,
      publishFlag: 1,
    },
  });
}

/**
 * @description: 删除报告
 */
export function delReport(params: IdModel) {
  return defHttp.request({
    url: Api.DelReportTemplate,
    method: 'GET',
    params,
  });
}

/**
 * @description: 查询报告
 */
export function getReportById(params) {
  return defHttp.request({
    url: Api.GetReportById,
    method: 'GET',
    params,
  });
}

/**
 * @description: 发布报告
 */
export function publishReport(params) {
  return defHttp.request<ResultEnum.TYPE>({
    url: Api.PublishReport,
    method: 'POST',
    params,
  });
}

/**
 * @description: 生成报告PDF
 */
export function generatePDF(params: IdModel) {
  return nodeHttp.request<{ pdfurl: string; jpgurl: string }>({
    url: Api.Report2PDF,
    method: 'GET',
    params,
  });
}
