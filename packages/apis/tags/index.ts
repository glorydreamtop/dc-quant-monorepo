import { defHttp } from '@dq-next/utils/http';

enum Api {
  GetTagLike = '/sys-tag-info/getIndexLike',
  AddTag = '/sys-tag-info/insertTag',
  AddTagToQuota = '/sys-tag-info/addIndex2Tag',
  GetTree = '/sys-tag-info/getTagTree',
  DelQuotaTag = '/sys-tag-info/deleteIndexTag',
}

export interface TagOption {
  id: number;
  tagName: string;
}

export function getTagLike(tagName: string) {
  return defHttp.request<TagOption[]>({
    url: Api.GetTagLike,
    method: 'GET',
    params: {
      tagName,
    },
  });
}

export function addTag(params: { tagName: string; remark?: string }) {
  return defHttp.request({
    url: Api.AddTag,
    method: 'POST',
    params,
  });
}

export function getTagTree(params: { id: number }) {
  return defHttp.request({
    url: Api.GetTree,
    method: 'GET',
    params,
  });
}

export function addTagToQuota(params: { idList: number[]; indexList: number[] }) {
  return defHttp.request({
    url: Api.AddTagToQuota,
    method: 'POST',
    params,
  });
}

export function delQuotaTag(params: { idList: number[]; indexList: number[] }) {
  return defHttp.request({
    url: Api.DelQuotaTag,
    method: 'POST',
    params,
  });
}
