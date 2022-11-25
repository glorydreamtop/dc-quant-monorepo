import { QuotaItem } from '/#/quota';
import { quotaDataExportTypeEnum } from '@dq-next/http-apis/quota';
export interface tagContextModel {
  label: string;
  value: string;
}
export interface chartSetConfigModel {
  id: number;
  inverse: boolean;
  max: null | number;
  min: null | number;
  axisLabel: {
    formatter: null | Function;
  };
}
export interface indexOptModel {
  id: number;
  industry: string;
  name: string;
  dateFirst: string;
  dateLast: string;
  commodity: string;
}
export interface paramLineModel {
  lastFlag: boolean;
  startDate: string;
  endDate: string;
  rows: QuotaItem[];
  exportPara: quotaDataExportTypeEnum;
}
export interface rowsModel {
  id: number;
  name: string;
  sourceCode: string;
  sourceType: string;
}
export interface yearOptionsModel {
  year: number;
  option: {
    title: {
      text: string;
      left: string;
    };
  };
}
