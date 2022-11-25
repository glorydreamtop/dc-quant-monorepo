export interface recordModel {
  id: number;
  specialName: string;
  userId: number;
  specialType: string;
}
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
  group_district: string;
  group_dt: string;
  products: string[];
  region: string[];
  regions: string[];
  start_dt: string; // jodi 日期参数
  end_dt: string;
  departure_date_from: string; // vessel 日期参数
  departure_date_to: string;
  arrival_date_from: string;
  arrival_date_to: string;
  sum_type: string;
  timeRange: string[];
  unit: string;
}
export interface selectedTemplateModel {
  config: configModel;
}
