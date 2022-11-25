export interface configModel {
  title: string;
  startDate: string;
  endDate: string;
  type: string;
  fixData: fixDataModel[];
  seriesCfgMap?: object;
}
export interface fixDataModel {
  data: number[][];
  id: number | string;
  name: string;
}
export interface optionsModel {
  balance: string;
  chart_title: string;
  chart_type: string;
  country: string[];
  countries: string[];
  end_dt: string;
  group_district: string;
  group_dt: string;
  products: string[];
  region: string[];
  regions: string[];
  start_dt: string;
  sum_type: string;
  timeRange: string[];
  unit: string;
}
export interface selectedTemplateModel {
  id: string;
  config: configModel;
  options: optionsModel;
}
export interface editInfoModel {
  id: number;
  userName: string;
  userId: number;
  specialType: string;
  specialName: string;
  options: string;
}
export interface submitParamsModel {
  specialName: string;
  specialType: string;
  options: string;
  id?: number;
}
