import type { YAXisComponentOption, XAXisComponentOption } from 'echarts';
import { quotaDataPastUnitTypeEnum } from '@dq-next/http-apis/quota';
import { getQuotaDataResult } from '@dq-next/http-apis/quota/model';
import {
  chartTypeEnum,
  echartLineTypeEnum,
  echartSeriesTypeEnum,
  structuralOffsetUnitEnum,
  timeConfigEnum,
  versionEnum,
} from '/@/enums/chartEnum';
import { SelectedQuotaItem } from '/@/views/quota/quotaView/components/hooks';

export interface timeConfigType {
  startDate: string;
  endDate: string;
  type: timeConfigEnum;
  /**
   * 当type是recent时，需要一个规则来计算开始日期，
   * 数量|单位|周期或自然日，单位有days/weeks/months/years，周期cycle，自然日nature
   */
  timeRule?: string;
  pastUnit?: quotaDataPastUnitTypeEnum;
  pastValue?: number;
  /**
   * 不要的月份
   */
  sortMonth?: number[];
  startMonth?: number;
  sortYear?: string[];
}

export interface seriesSettingType {
  // 开启阴影
  shadow?: boolean;
  // 线的粗细或散点的半径等尺寸
  size?: number;
  seriesType: echartSeriesTypeEnum;
  // 线的类型，如虚线，点线，实线，
  lineType?: echartLineTypeEnum;
  // 直角坐标系的图，线或柱对应的Y轴
  yAxisIndex?: number | undefined;
  // 直角坐标系的图，线或柱对应的X轴
  xAxisIndex?: number | undefined;
  // 序列的名字或序号等唯一标识
  name?: string;
  legendName?: string;
  color?: string;
  // 显示所有点标记
  symbol?: boolean;
  // 显示label的点
  symbolPoints?: string[];
  currentPoint?: [string, number?];
}
// export interface baseQuotaSettingType {}
export interface baseChartConfigType {
  // 图表标题
  title: string;
  // 图表名字
  name?: string;
  // 配色方案Id
  colorSchemeId?: number;
  // 自有配色方案
  selfColorScheme: string;
  // 图表类型
  type: chartTypeEnum;
  // 时间相关配置
  timeConfig: timeConfigType;
  // 数据格式化方式
  valueFormatter: {
    afterDot: number;
    normalized: boolean;
  };
  http?: boolean;
  fixData?: getQuotaDataResult[];

  quotaList: Nullable<SelectedQuotaItem[]>;
  seriesSetting: seriesSettingType[];
  readonly version: versionEnum.PROChart;
}

export interface reactSettingType {
  showLastest: boolean;
  showHighest: boolean;
}

export type YAxisOption = YAXisComponentOption & {
  alignZero?: boolean;
};

export type XAxisOption = XAXisComponentOption;

export interface seasonalChartConfigType extends reactSettingType, baseChartConfigType {
  xAxis: XAxisOption[];
  yAxis: YAxisOption[];
  removePoint?: {
    xRange: string;
    seriesName: string;
  }[];
}

export interface normalChartConfigType extends reactSettingType, baseChartConfigType {
  [x: string]: any;
  xAxis: XAxisOption[];
  yAxis: YAxisOption[];
  removePoint?: {
    xRange: string;
    seriesName: string;
  }[];
}

export interface barChartConfigType extends reactSettingType, baseChartConfigType {
  xAxis: XAxisOption[];
  yAxis: YAxisOption[];
}

export interface radarChartConfigType extends reactSettingType, baseChartConfigType {}

export interface quantileRadarChartConfigType extends reactSettingType, baseChartConfigType {
  quantileOffset: string;
}

export interface structuralChartConfigType extends reactSettingType, baseChartConfigType {
  xAxis: XAxisOption[];
  yAxis: YAxisOption[];
  structuralOffset: string;
  structuralOffsetUnit: structuralOffsetUnitEnum;
}

export interface pieChartConfigType extends reactSettingType, baseChartConfigType {}

export type chartConfigType =
  | seasonalChartConfigType
  | normalChartConfigType
  | barChartConfigType
  | radarChartConfigType
  | structuralChartConfigType
  | pieChartConfigType;

export interface chartSetting {
  fullscreen: boolean;
  mark: boolean;
  side: boolean;
  download: boolean;
}
