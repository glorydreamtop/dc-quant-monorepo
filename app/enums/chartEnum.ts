export enum chartTypeEnum {
  // 普通多指标数据序列
  normal = 'normal',
  // 单指标季节性序列
  seasonal = 'seasonal',
  // 单指标季节性农历序列
  seasonalLunar = 'seasonalLunar',
  // 多指标柱状图
  bar = 'bar',
  // 普通多指标雷达图
  normalRadar = 'normalRadar',
  // 多指标分位数雷达图
  quantileRadar = 'quantileRadar',
  // 多指标曲线结构折线图
  structural = 'structural',
  // 多指标单饼图
  pie = 'pie',
}

export enum timeConfigEnum {
  /**
   * 开始日期由结束日期按规则往前推算
   */
  recent = 'recent',
  /**
   * 开始日期和结束日期永远固定
   */
  fixed = 'fixed',
  /**
   * 非阶段性数据，无开始日期，按结束日期有值的当天查询，today则结束日期永远最新
   */
  today = 'today',
  /**
   * 默认，按照外部环境的参数注入
   */
  default = 'default',
}

export enum echartSeriesTypeEnum {
  line = 'line',
  smoothLine = 'smoothLine',
  bar = 'bar',
  scatter = 'scatter',
  area = 'area',
  radar = 'radar',
  pie = 'pie',
}

export enum echartLineTypeEnum {
  solid = 'solid',
  dashed = 'dashed',
  dotted = 'dotted',
}

export enum structuralOffsetUnitEnum {
  natureDay = 'natureDay',
  tradingDay = 'tradingDay',
}

export enum versionEnum {
  PINGChart,
  HUIChart,
  PROChart,
  HUITable,
  SQLTable,
  SQLChart,
}
