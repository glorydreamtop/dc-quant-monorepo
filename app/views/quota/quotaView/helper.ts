import type {
  barChartConfigType,
  chartConfigType,
  normalChartConfigType,
  pieChartConfigType,
  quantileRadarChartConfigType,
  radarChartConfigType,
  seasonalChartConfigType,
  structuralChartConfigType,
} from '/#/chart';
import { today, yearsAgo } from '@dq-next/utils/dateUtil';
import {
  timeConfigEnum,
  chartTypeEnum,
  structuralOffsetUnitEnum,
  versionEnum,
} from '/@/enums/chartEnum';
import { quotaDataPastUnitTypeEnum } from '@dq-next/http-apis/quota';
import { cloneDeep, merge } from 'lodash-es';

const baseConfig: Partial<chartConfigType> = {
  title: '',
  name: '',
  timeConfig: {
    startDate: yearsAgo(5),
    endDate: today(),
    type: timeConfigEnum.default,
    sortMonth: [],
    startMonth: 1,
    sortYear: [],
    pastUnit: quotaDataPastUnitTypeEnum.last,
    pastValue: 0,
  },
  selfColorScheme: '',
  showLastest: true,
  showHighest: false,
  quotaList: [],
  valueFormatter: {
    afterDot: 2,
    normalized: false,
  },
  seriesSetting: [],
  http: true,
  version: versionEnum.PROChart,
};

const baseYAxisConfig = [
  {
    min: undefined,
    max: undefined,
    inverse: false,
    name: '左1',
    offset: 0,
    axisLine: {
      show: true,
      lineStyle: {
        color: '#999999',
      },
    },
    position: 'left',
    axisLabel: {
      formatter: '{value}',
    },
  },
];

const baseXAxisConfig = ({ formatter }: { formatter: string }) => {
  return [
    {
      min: undefined,
      max: undefined,
      inverse: false,
      name: '主1',
      offset: 0,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#999999',
        },
      },
      position: 'bottom',
      axisLabel: {
        formatter,
      },
    },
  ];
};

export function getChartDefaultConfig(type: chartTypeEnum): Partial<chartConfigType> {
  const defaultConfig = {
    normal: {
      type: chartTypeEnum.normal,
      xAxis: baseXAxisConfig({ formatter: '{yyyy}/{M}/{d}' }),
      yAxis: baseYAxisConfig,
    } as normalChartConfigType,
    seasonal: {
      type: chartTypeEnum.seasonal,
      yAxis: baseYAxisConfig,
    } as seasonalChartConfigType,
    bar: {
      timeConfig: {
        startDate: yearsAgo(1),
        endDate: today(),
        type: timeConfigEnum.default,
        pastUnit: quotaDataPastUnitTypeEnum.last,
        pastValue: 3,
        startMonth: 1,
      },
      type: chartTypeEnum.bar,
      xAxis: baseXAxisConfig({ formatter: '{value}' }),
      yAxis: baseYAxisConfig,
    } as barChartConfigType,
    normalRadar: {
      timeConfig: {
        startDate: yearsAgo(1),
        endDate: today(),
        type: timeConfigEnum.default,
        pastUnit: quotaDataPastUnitTypeEnum.last,
        pastValue: 3,
      },
      type: chartTypeEnum.normalRadar,
    } as radarChartConfigType,
    quantileRadar: {
      timeConfig: {
        startDate: yearsAgo(5),
        endDate: today(),
        type: timeConfigEnum.default,
      },
      type: chartTypeEnum.quantileRadar,
      quantileOffset: '1,2,3,5',
    } as quantileRadarChartConfigType,
    structural: {
      timeConfig: {
        startDate: yearsAgo(1),
        endDate: today(),
        type: timeConfigEnum.default,
        pastUnit: quotaDataPastUnitTypeEnum.last,
        pastValue: 3,
      },
      type: chartTypeEnum.structural,
      structuralOffset: '30,15,7,1,0',
      structuralOffsetUnit: structuralOffsetUnitEnum.natureDay,
      yAxis: baseYAxisConfig,
    } as structuralChartConfigType,
    pie: {
      timeConfig: {
        startDate: yearsAgo(1),
        endDate: today(),
        type: timeConfigEnum.default,
        pastUnit: quotaDataPastUnitTypeEnum.last,
        pastValue: 1,
      },
      type: chartTypeEnum.pie,
    } as pieChartConfigType,
  };
  const config = cloneDeep(baseConfig);
  merge(config, defaultConfig[type]);
  return cloneDeep(config);
}
