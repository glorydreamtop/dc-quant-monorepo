import { quotaDataExportTypeEnum, quotaDataPastUnitTypeEnum } from '.';
import { QuotaItem } from '/#/quota';

export interface getQuotaDataParams {
  startDate: string;
  endDate: string;
  exportPara?: quotaDataExportTypeEnum;
  lastFlag?: boolean;
  pastUnit?: quotaDataPastUnitTypeEnum;
  pastValue?: number;
  rows: QuotaItem[];
  exportConfig?: string;
}

export type getQuotaDataResult = { id: number; name: string; data: Array<[number, number]> };

export interface requestUpdateParams {
  categoryId: number;
  indexIdList: number[];
}

export interface importJsonParams {
  importPara: number;
  jsonObj: string;
}
