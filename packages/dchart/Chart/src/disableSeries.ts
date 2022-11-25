import { chartTypeEnum, echartSeriesTypeEnum } from '/@/enums/chartEnum';

// 某图表类型不允许将seriesType切换的黑名单
export const disableSeriesType = {
  [chartTypeEnum.normal]: [echartSeriesTypeEnum.radar, echartSeriesTypeEnum.pie],
  [chartTypeEnum.seasonal]: [echartSeriesTypeEnum.radar, echartSeriesTypeEnum.pie],
  [chartTypeEnum.bar]: [echartSeriesTypeEnum.radar, echartSeriesTypeEnum.pie],
  [chartTypeEnum.normalRadar]: [
    echartSeriesTypeEnum.line,
    echartSeriesTypeEnum.scatter,
    echartSeriesTypeEnum.smoothLine,
    echartSeriesTypeEnum.pie,
    echartSeriesTypeEnum.bar,
  ],
  [chartTypeEnum.quantileRadar]: [
    echartSeriesTypeEnum.area,
    echartSeriesTypeEnum.line,
    echartSeriesTypeEnum.scatter,
    echartSeriesTypeEnum.smoothLine,
    echartSeriesTypeEnum.pie,
    echartSeriesTypeEnum.bar,
  ],
  [chartTypeEnum.structural]: [echartSeriesTypeEnum.radar, echartSeriesTypeEnum.pie],
  [chartTypeEnum.pie]: [
    echartSeriesTypeEnum.area,
    echartSeriesTypeEnum.line,
    echartSeriesTypeEnum.scatter,
    echartSeriesTypeEnum.smoothLine,
    echartSeriesTypeEnum.radar,
    echartSeriesTypeEnum.bar,
  ],
};
