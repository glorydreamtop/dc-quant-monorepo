import { InjectionKey, Ref, ref, computed, ComputedRef } from 'vue';
import { createContext, useContext } from '/@/hooks/core/useContext';
import type { QuotaItem } from '/#/quota';
import { chartConfigType, normalChartConfigType } from '/#/chart';
import { getQuotaDataResult } from '@dq-next/http-apis/quota/model';
import { ECBasicOption } from 'echarts/types/dist/shared';
import mitt from '@dq-next/utils/mitt';
import { useI18n } from '/@/hooks/web/useI18n';
import { cloneDeep } from 'lodash-es';
import { useMessage } from '/@/hooks/web/useMessage';
import { chartTypeEnum } from '/@/enums/chartEnum';
import { getYear } from '@dq-next/utils/dateUtil';

const { t } = useI18n();
const { createMessage } = useMessage();

export interface SelectedQuotaItem extends QuotaItem {
  selected: boolean;
}

// 交付给绘图的指标列表
const quotaKey: InjectionKey<Ref<SelectedQuotaItem[]>> = Symbol();

export function createQuotaListContext(context: Ref<QuotaItem[]>) {
  return createContext<Ref<SelectedQuotaItem[]>>(context, quotaKey, { native: true });
}

export function useQuotaListContext() {
  return useContext<Ref<SelectedQuotaItem[]>>(quotaKey);
}

// 所有从树中选中的指标
const selectedQuotaKey: InjectionKey<Ref<SelectedQuotaItem[]>> = Symbol();

export function createSelectedQuotaListContext(context: Ref<SelectedQuotaItem[]>) {
  return createContext<Ref<SelectedQuotaItem[]>>(context, selectedQuotaKey, { native: true });
}

export function useSelectedQuotaListContext() {
  return useContext<Ref<SelectedQuotaItem[]>>(selectedQuotaKey);
}

// 编辑器中的图表配置
const chartConfigKey: InjectionKey<chartConfigType> = Symbol();
// 浮动编辑器中的图表配置
const floatChartConfigKey: InjectionKey<normalChartConfigType> = Symbol();

export function createChartConfigContext<T = chartConfigType>(context: T) {
  return createContext<T>(context, chartConfigKey, { native: true });
}

export function useChartConfigContext(float = false) {
  return useContext<chartConfigType>(float ? floatChartConfigKey : chartConfigKey);
}

const chartOriginDataKey: InjectionKey<Ref<getQuotaDataResult[]>> = Symbol();

export function createChartOriginDataContext<T = Ref>(context: T) {
  return createContext<T>(context, chartOriginDataKey, { native: true });
}

export function useChartOriginDataContext() {
  return useContext<Ref<getQuotaDataResult[]>>(chartOriginDataKey);
}

const chartOptionsKey: InjectionKey<Ref<ECBasicOption>> = Symbol();

export function createChartOptionsContext<T = Ref>(context: T) {
  return createContext<T>(context, chartOptionsKey, { native: true });
}

export function useChartOptionsContext() {
  return useContext<Ref<ECBasicOption>>(chartOptionsKey);
}

export const echartMitter = mitt();

type useYAxisEditRes = [ComputedRef<any[]>, { delYAxis: (idx: number) => void }];
type useXAxisEditRes = [ComputedRef<any[]>, { delXAxis: (idx: number) => void }];

export function useYAxisEdit(chartConfig: chartConfigType): useYAxisEditRes {
  const yAxisIndexList = computed(() => {
    if (Reflect.has(chartConfig, 'yAxis')) {
      return chartConfig.yAxis.map((item, index) => {
        return {
          label: `${item.name}/${t('quotaView.advance.axisSetting.yAxis.min')}[${
            item.min || t('common.auto')
          }]-${t('quotaView.advance.axisSetting.yAxis.max')}[${item.max || t('common.auto')}]/${t(
            'quotaView.advance.axisSetting.yAxis.' + item.position,
          )}`,
          value: index,
          closable:
            !chartConfig.seriesSetting!.some((ser) => ser.yAxisIndex! === index) && index > 0,
        };
      });
    } else {
      return [];
    }
  });
  function delYAxis(idx: number) {
    const config = cloneDeep(chartConfig) as normalChartConfigType;
    // 检查当前轴是否被使用中
    const hasDep = config.seriesSetting!.find((ser) => ser.yAxisIndex! - 1 === idx);
    if (hasDep) {
      createMessage.warn(`[${hasDep.name}]` + t('quotaView.advance.axisSetting.yAxis.cannotdel'));
      return;
    }
    if (config.yAxis.length === 1) {
      createMessage.warn(t('quotaView.advance.axisSetting.yAxis.lastnotdel'));
      return;
    }
    chartConfig.yAxis.splice(idx, 1);
  }
  return [yAxisIndexList, { delYAxis }];
}

export function useXAxisEdit(chartConfig: chartConfigType): useXAxisEditRes {
  const xAxisIndexList = computed(() => {
    if (Reflect.has(chartConfig, 'xAxis')) {
      return chartConfig.xAxis.map((item, index) => {
        return {
          label: `${item.name}/${t('quotaView.advance.axisSetting.yAxis.min')}[${
            item.min || t('common.auto')
          }]-${t('quotaView.advance.axisSetting.yAxis.max')}[${item.max || t('common.auto')}]/${t(
            'quotaView.advance.axisSetting.xAxis.' + item.position,
          )}`,
          value: index,
          closable:
            !chartConfig.seriesSetting!.some((ser) => ser.xAxisIndex! === index) && index > 0,
        };
      });
    } else {
      return [];
    }
  });
  function delXAxis(idx: number) {
    const config = cloneDeep(chartConfig) as normalChartConfigType;
    // 检查当前轴是否被使用中
    const hasDep = config.seriesSetting!.find((ser) => ser.xAxisIndex! - 1 === idx);
    if (hasDep) {
      createMessage.warn(`[${hasDep.name}]` + t('quotaView.advance.axisSetting.yAxis.cannotdel'));
      return;
    }
    if (config.yAxis.length === 1) {
      createMessage.warn(t('quotaView.advance.axisSetting.yAxis.lastnotdel'));
      return;
    }
    chartConfig.xAxis.splice(idx, 1);
  }
  return [xAxisIndexList, { delXAxis }];
}

type useSortMonthRes = [
  {
    monthList: Ref<number[]>;
    yearList: Ref<string[]>;
  },
  {
    startMonthChange: ({ target: { value } }: { target: HTMLInputElement }) => void;
    sortYearChange: (e: PointerEvent) => void;
    sortMonthChange: (e: PointerEvent) => void;
    updateYears: () => void;
  },
];

export function useSortMonthAndYear(chartConfig: chartConfigType): useSortMonthRes {
  // 调整起始月份
  const monthList = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  function startMonthChange({ target: { value } }: { target: HTMLInputElement }) {
    if (!(parseInt(value) > 0 && parseInt(value) < 13)) {
      setTimeout(() => {
        chartConfig.timeConfig.startMonth = 1;
      }, 500);
      createMessage.warn(t('quotaView.advance.datasourceSetting.startMonthTip'));
      return;
    }
    chartConfig.timeConfig.startMonth = parseInt(value);
    const index = monthList.value!.indexOf(parseInt(value));
    const [a1, a2] = [monthList.value.slice(0, index), monthList.value.slice(index)];
    monthList.value = [...a2, ...a1];
    updateYears();
  }
  function updateYears() {
    const startYear = getYear(chartConfig.timeConfig.startDate);
    const endYear = getYear(chartConfig.timeConfig.endDate);
    yearList.value = [];
    const startMonth = chartConfig.timeConfig.startMonth;
    for (let i = startYear; i <= endYear + 1; i++) {
      yearList.value.push(startMonth !== 1 ? `${i - 1}-${i}` : `${i}`);
    }
  }

  // 修改不要的月份
  function sortMonthChange(e: PointerEvent) {
    const m = parseInt((e.target as HTMLElement).dataset.month ?? NaN);
    if (m) {
      const idx = chartConfig.timeConfig.sortMonth!.indexOf(m);
      if (idx !== -1) {
        chartConfig.timeConfig.sortMonth?.splice(idx, 1);
      } else {
        chartConfig.timeConfig.sortMonth?.push(m);
        chartConfig.timeConfig.sortMonth?.sort();
      }
    }
  }
  const yearList = ref<string[]>([]);
  updateYears();
  // 修改不要的年份
  function sortYearChange(e: PointerEvent) {
    const y = (e.target as HTMLElement).dataset.year;
    if (y) {
      const idx = chartConfig.timeConfig.sortYear!.indexOf(y);
      if (idx !== -1) {
        chartConfig.timeConfig.sortYear?.splice(idx, 1);
      } else {
        chartConfig.timeConfig.sortYear?.push(y);
      }
    }
  }
  return [
    { monthList, yearList },
    { startMonthChange, sortYearChange, sortMonthChange, updateYears },
  ];
}

export function useSettingFilter(chartConfig: chartConfigType) {
  const filter = {
    [chartTypeEnum.normal]: ['yAxisEdit', 'sortMonth', 'pastValue', 'removePoint'],
    [chartTypeEnum.seasonal]: ['yAxisEdit', 'sortMonth', 'startMonth', 'sortYear', 'removePoint'],
    [chartTypeEnum.seasonalLunar]: ['yAxisEdit', 'sortMonth', 'startMonth', 'removePoint'],
    [chartTypeEnum.normalRadar]: ['pastValue'],
    [chartTypeEnum.quantileRadar]: ['quantileOffset'],
    [chartTypeEnum.bar]: ['yAxisEdit', 'pastValue'],
    [chartTypeEnum.structural]: ['yAxisEdit', 'structuralOffset'],
    [chartTypeEnum.pie]: ['pastValue'],
  };
  return function showSettingFilter(modelName: string) {
    return filter[chartConfig.type].includes(modelName);
  };
}
