interface PageParams {
  currPage: number;
  pageSize: number;
}

export type BasicPageParams<T = {}> = PageParams & T;
export interface BasicFetchResult<T> {
  list: T[];
  totalCount: number;
  pageSize: number;
  totalPage: number;
  currPage: number;
}

export interface IdModel {
  id: number;
}

export type BasicIdParams<T = {}> = IdModel & T;
