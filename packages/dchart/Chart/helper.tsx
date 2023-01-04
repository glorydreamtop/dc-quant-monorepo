import { getQuotaData } from '@dq-next/http-apis/quota';
import { getQuotaDataParams, getQuotaDataResult } from '@dq-next/http-apis/quota/model';
import { Popover, Input } from 'ant-design-vue';
import { h, ref, render } from 'vue';
import { chartConfigType, normalChartConfigType, seriesSettingType } from '../chart';
import {
  EChartsOption,
  GraphicComponentOption,
  LegendComponentOption,
  SeriesOption,
  YAXisComponentOption,
  GridComponentOption,
  EChartsType,
} from 'echarts';
import { encodeSvgForCss } from '@dq-next/icon';
import { last, maxBy, nth, remove, round, cloneDeep, has, isObject,isNumber, isArray } from 'lodash-es';
import { chartTypeEnum, echartLineTypeEnum, echartSeriesTypeEnum } from '/@/enums/chartEnum';
import { dateUtil, daysAgo, formatToDate, getMonth, toTimeStamp } from '@dq-next/utils/dateUtil';
import { useI18n } from '/@/hooks/web/useI18n';
import YAxisEdit from './src/YAxisEditor.vue';
import XAxisEdit from './src/XAxisEditor.vue';
import SeriesEdit from './src/SeriesEditor.vue';
import { getColorScheme } from '@dq-next/http-apis/color';
import { fade, rgbToHex } from '@dq-next/utils/color';

const { t } = useI18n();
export async function fetchQuotaData(params: getQuotaDataParams) {
  const res = await getQuotaData(params);
  return res;
}

interface chartTitlePopoverParams {
  chartConfig: chartConfigType;
  onOk: (str: string) => void;
}

const MOUNTNODE = 'mount-node';

export function createMountNode(e) {
  const { clientX, clientY } = e.event?.event as MouseEvent;
  const dom = document.createElement('span');
  dom.className = MOUNTNODE;
  Object.assign(dom.style, {
    position: 'fixed',
    top: `${clientY}px`,
    left: `${clientX}px`,
    zIndex: '19',
  });
  document.body.appendChild(dom);
  return dom;
}

// 支持修改标题
export function useChartTitlePopover({ onOk, chartConfig }: chartTitlePopoverParams) {
  const title = ref('');
  return function (dom: HTMLElement) {
    title.value = chartConfig.title;
    function input() {
      // @ts-ignore
      return h(Input, {
        style: {
          width: '200px',
        },
        defaultValue: title,
        onChange: function (e) {
          title.value = e.target.value;
        },
      });
    }
    const pop = h(Popover, {
      content: input(),
      defaultVisible: true,
      trigger: 'click',
      destroyTooltipOnHide: true,
      getPopupContainer: (_) => dom,
      onVisibleChange: (visible: boolean) => {
        if (!visible) {
          onOk(title.value);
          if (dom.className === MOUNTNODE) {
            dom.remove();
          }
        }
      },
    });
    render(pop, dom);
  };
}

interface yAxixIndexEditParams {
  chartConfig: normalChartConfigType;
  onOk: (v: normalChartConfigType) => void;
}
// 支持Y轴编辑
export function useYAxisIndexEdit({ chartConfig, onOk }: yAxixIndexEditParams) {
  return function (dom: HTMLElement, { yAxisIndex }: any) {
    const idx = yAxisIndex;
    function YAxisEditComponent() {
      const editPopover = h(YAxisEdit, {
        chartConfig,
        idx,
        onVisibleChange: (v: boolean) => {
          // 关闭时销毁挂载点
          if (!v && dom.className === MOUNTNODE) {
            dom.remove();
          }
        },
        onUpdate: (v: any) => {
          onOk(v);
        },
        getPopupContainer: () => dom,
      });
      return editPopover;
    }
    const component = YAxisEditComponent();
    render(component, dom);
    // 外部触发气泡显示
    component.component!.exposed!.setVisible(true);
  };
}

// 支持X轴编辑
export function useXAxisIndexEdit({ chartConfig, onOk }: yAxixIndexEditParams) {
  return function (dom: HTMLElement, { xAxisIndex }: any) {
    const idx = xAxisIndex;
    function XAxisEditComponent() {
      const editPopover = h(XAxisEdit, {
        chartConfig,
        idx,
        onVisibleChange: (v: boolean) => {
          // 关闭时销毁挂载点
          if (!v && dom.className === MOUNTNODE) {
            dom.remove();
          }
        },
        onUpdate: (v: any) => {
          onOk(v);
        },
        getPopupContainer: () => dom,
      });
      return editPopover;
    }
    const component = XAxisEditComponent();
    render(component, dom);
    // 外部触发气泡显示
    component.component!.exposed!.setVisible(true);
  };
}

type GraphicOption = GraphicComponentOption & {
  ondragend?: (e: any) => void;
  groupType: 'textRect' | 'rect' | 'mark';
};

function createRichText(data: lastestDataType[], options: EChartsOption, title: string) {
  const text =
    `{title|${title}}\n` +
    data
      .map((item) => {
        const DIFF = item.diff
          ? item.diff > 0
            ? `{more|${item.diff}}`
            : `{less|${item.diff}}`
          : '';
        const VALUE = `{val|${item.value}}`;
        return `${item.name} [${item.date}] ${VALUE} ${DIFF}`;
      })
      .join('\n');
  const container = document.createElement('div');
  Object.assign(container.style, {
    fontSize: '12px',
    fontFamily: 'Microsoft YaHei',
    lineHeight: '18px',
    position: 'absolute',
    paddingBottom: '5px',
    paddingRight: '5px',
  });
  container.innerText = text.replaceAll(/\{|}|less|more|val|\|/g, '');
  document.getElementById('app')!.append(container);
  const width = container.clientWidth;
  const height = container.clientHeight;
  container.remove();
  // 找到图中存在的其他模块，方便给本模块设置初始定位,只找文本块的
  //@ts-ignore
  const lastGraphicGroup = last(
    ((options.graphic as GraphicComponentOption).elements as any[]).filter(
      (e) => e.groupType === 'textRect',
    ),
  );
  //@ts-ignore
  const left = lastGraphicGroup ? lastGraphicGroup.left + lastGraphicGroup.shape.width + 10 : '10%';
  const lastestConfig: GraphicOption = {
    type: 'group',
    groupType: 'textRect',
    left,
    top: '10%',
    draggable: true,
    shape: {
      width: width + 10,
      height: height + 10,
    },
    children: [
      {
        type: 'rect',
        z: 100,
        left: 0,
        top: 0,
        shape: {
          x: 0,
          y: 0,
          width: width + 15,
          height: height + 5,
        },
        style: {
          fill: '#ffffffdd',
          stroke: '#555',
          shadowBlur: 8,
          lineWidth: 0,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowColor: 'rgba(0,0,0,0.2)',
        },
      },
      {
        type: 'text',
        z: 100,
        left: 10,
        top: 10,
        style: {
          fill: '#333',
          text,
          fontFamily: 'Microsoft YaHei',
          fontSize: '12px',
          rich: {
            title: {
              fontWeight: 'bold',
            },
            val: {
              fill: '#333',
              fontWeight: 'bold',
              height: 18,
            },
            more: {
              fill: '#DC143C',
              height: 18,
              fontStyle: 'italic',
            },
            less: {
              fill: '#008000',
              height: 18,
              fontStyle: 'italic',
            },
          },
        },
      },
    ],
  };
  lastestConfig.ondragend = (e: any) => {
    console.log(e);
  };
  // @ts-ignore
  options.graphic.elements.push(lastestConfig);
}
interface lastestQuotaDataParams extends baseHelperParams {
  options: EChartsOption;
}

interface lastestDataType {
  name: string;
  date: string;
  diff?: number;
  value: number;
}

// 最新值模块
export async function useLastestQuotaData({
  chartConfig,
  quotaDataList,
  options,
}: lastestQuotaDataParams) {
  // 单指标的图形
  const singleQuotaChartTypes = [chartTypeEnum.seasonal, chartTypeEnum.seasonalLunar];
  if (chartConfig.showLastest) {
    const lastestData: lastestDataType[] = [];
    if (singleQuotaChartTypes.includes(chartConfig.type)) {
      // 找到最新日期
      const lastDate = dateUtil(last(quotaDataList[0].data)![0]).year(2020).unix() * 1000;
      const series = options.series as SeriesOption[];
      series.forEach((item, idx) => {
        const data = item.data as [number, number][];
        const dataLen = data.length;
        for (let index = 0; index < data.length; index++) {
          const e = data[index];
          // 查找每年的这一天，某年当天无数据则沿用前一天，或直到这年数据的最后一个
          if (index + 1 === dataLen || (e[0] <= lastDate && lastDate < data[index + 1][0])) {
            lastestData.push({
              name: item.name as string,
              date: formatToDate(e[0], 'MM-DD'),
              value: e[1],
              // 计算差值，减去前一期，有可能是去年的最后一期并保留N位小数
              diff: round(
                index > 0
                  ? e[1] - data[index - 1][1]
                  : e[1] - last(series[idx - 1].data as [number, number][])![1],
                chartConfig.valueFormatter.afterDot,
              ),
            });
            break;
          }
        }
      });
    } else {
      function getDate(str: number | string) {
        if (chartConfig.type === chartTypeEnum.structural) {
          str = parseInt(str);
          return daysAgo(str, chartConfig.timeConfig.endDate);
        } else {
          return str;
        }
      }
      quotaDataList.forEach((quotaData) => {
        const l = last(quotaData.data)!;
        lastestData.push({
          name: quotaData.name,
          date: formatToDate(getDate(l[0]), 'MM-DD'),
          value: round(l[1], chartConfig.valueFormatter.afterDot),
          // 如果数据量不足无法计算差值则不显示
          diff: (function () {
            if (quotaData.data.length > 1) {
              return round(l[1] - nth(quotaData.data, -2)![1], chartConfig.valueFormatter.afterDot);
            } else {
              return NaN;
            }
          })(),
        });
      });
    }
    // 开始创建echart富文本
    createRichText(lastestData, options, t('quotaView.advance.rectSetting.lastest'));
  }
}
// 最高值模块
export async function useHighestQuotaData({
  chartConfig,
  quotaDataList,
  options,
}: lastestQuotaDataParams) {
  // 单指标的图形
  const singleQuotaChartTypes = [chartTypeEnum.seasonal, chartTypeEnum.seasonalLunar];
  if (chartConfig.showHighest) {
    const highestData: lastestDataType[] = [];
    if (singleQuotaChartTypes.includes(chartConfig.type)) {
      const series = options.series as SeriesOption[];
      series.forEach((item) => {
        const data = item.data as [number, number][];
        const m = maxBy(data, (_) => _[1])!;
        highestData.push({
          name: item.name as string,
          date: formatToDate(m[0], 'MM-DD'),
          value: m[1],
        });
      });
    } else {
      quotaDataList.forEach((quotaData) => {
        const m = maxBy(quotaData.data, (_) => _[1])!;
        highestData.push({
          name: quotaData.name,
          date: formatToDate(m[0], 'MM-DD'),
          value: m[1],
        });
      });
    }
    // 开始创建echart富文本
    createRichText(highestData, options, t('quotaView.advance.rectSetting.highest'));
  }
}

interface addGraphicElementParams {
  options: EChartsOption;
}
// 创建模块容器
export function useAddGraphicElement({ options }: addGraphicElementParams) {
  const graphic: GraphicComponentOption = {
    elements: [],
  };
  Object.assign(options, {
    graphic,
  });
}

interface createRemarkParams {
  options: EChartsOption;
  remark: {
    text: string;
    point: [number, number];
  };
}

// 创建备注模块
export function createRemark({ options }: createRemarkParams) {
  const position = {
    x1: 0,
    y1: 0,
    x2: 40,
    y2: 30,
  };
  const { x1, x2, y1, y2 } = position;
  const arrow = `<svg xmlns='http://www.w3.org/2000/svg' width='60px' height='60px' viewBox='0 0 60 60'> 
    <defs> 
      <marker id='arrow' markerWidth='10' markerHeight='10' refX='0' refY='5' orient='auto' markerUnits='userSpaceOnUse'>
        <path d='M0,0 L0,10 L9,5 z' fill='#f00' />
      </marker> 
    </defs> 
    <line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='#000' stroke-width='1' marker-end='url(#arrow)' />
  </svg>`;
  const data = `data:image/svg+xml;charset=utf8,${encodeSvgForCss(arrow)}`;
  const remark: GraphicComponentOption = {
    type: 'image',
    left: 100,
    top: 100,
    style: {
      image: data,
      width: 60,
      height: 60,
    },
  };
  // @ts-ignore
  options.graphic.elements.push(remark);
}

interface baseHelperParams {
  quotaDataList: getQuotaDataResult[];
  chartConfig: chartConfigType;
}
// 月份过滤
export function useSortMonth({ chartConfig, quotaDataList }: baseHelperParams) {
  const sortMonth = chartConfig.timeConfig.sortMonth;
  if (!sortMonth || sortMonth.length === 0) {
    return;
  }
  quotaDataList.forEach((quota) => {
    quota.data = quota.data.filter((data) => {
      return !sortMonth.includes(getMonth(data[0]) + 1);
    });
  });
}

interface useSortYearParams {
  series: SeriesOption[];
  chartConfig: chartConfigType;
  legend: LegendComponentOption;
}
// 年份过滤
export function useSortYear({ chartConfig, series, legend }: useSortYearParams) {
  const sortYear = chartConfig.timeConfig.sortYear;
  if (!sortYear || sortYear.length === 0) {
    return;
  }
  remove(series, (s) => sortYear.includes(s.name as string));
  remove(legend.data!, (l) => sortYear.includes(l as string));
}

// 多个饼图子标题生成
export function useMultiPie({ chartConfig }: Omit<baseHelperParams, 'quotaDataList'>) {
  const title: any[] = [
    {
      text: chartConfig.title,
      left: 'center',
      triggerEvent: true,
    },
  ];
  const maxLen = chartConfig.timeConfig.pastValue!;
  for (let index = 0; index < maxLen; index++) {
    const subtitle = {
      subtext: useRecentLegend(maxLen, index),
      left: `${(100 / (maxLen + 1)) * (index + 1)}%`,
      top: '80%',
      textAlign: 'center',
    };
    title.push(subtitle);
  }
  return { title };
}

// 最近N期图例文本生成
export function useRecentLegend(len: number, index: number, inverse = true) {
  if (inverse) {
    const idx = len - index - 1;
    if (idx === 0) {
      return t('common.last');
    }
    return t('quotaView.chart.inserveIndex') + idx + t('quotaView.chart.unit');
  } else {
    return t('quotaView.chart.inserveIndex') + `${index + 1}` + t('quotaView.chart.unit');
  }
}

// 支持折线图series右键菜单
export function useLineChartContextMenu({ onOk, chartConfig }: chartTitlePopoverParams) {
  return function (dom: HTMLElement, e: any, options: EChartsOption) {
    // const idx = xAxisIndex;
    function SeriesEditComponent() {
      let yAxisIndexCache;
      let xAxisIndexCache;
      const editPopover = h(SeriesEdit, {
        chartConfig,
        seriesInfo: e,
        options,
        onVisibleChange: (v: boolean) => {
          // 关闭时销毁挂载点
          if (!v && dom.className === MOUNTNODE) {
            dom.remove();
          }
        },
        onUpdate: (v: any) => {
          if (yAxisIndexCache) {
            v.yAxis!.push(yAxisIndexCache);
          }
          if (xAxisIndexCache) {
            v.xAxis!.push(xAxisIndexCache);
          }
          onOk(v);
        },
        onAddYAxis: (v) => {
          yAxisIndexCache = v;
        },
        onAddXAxis: (v) => {
          xAxisIndexCache = v;
        },
        getPopupContainer: () => dom,
      });
      return editPopover;
    }
    const component = SeriesEditComponent();
    render(component, dom);
    // 外部触发气泡显示
    component.component!.exposed!.setVisible(true);
  };
}

export function useNormalized({ chartConfig, quotaDataList }: baseHelperParams) {
  if (!chartConfig.valueFormatter.normalized) return;
  const afterDot = chartConfig.valueFormatter.afterDot;
  quotaDataList.forEach((quota) => {
    const base = quota.data[0][1];
    quota.data.forEach((data) => {
      data[1] = round(data[1] / base, afterDot);
    });
  });
}

// 合成颜色方案
export async function useColor({ chartConfig }: { chartConfig: chartConfigType }) {
  const id = chartConfig.colorSchemeId;
  const selfColors = chartConfig.selfColorScheme.split(',');
  if (id) {
    const { colors } = await getColorScheme({ id: id });
    // merge一下自有颜色和方案颜色，得到最终颜色
    const finalColor = colors.split(',').map((v, idx) => {
      const bool = selfColors[idx] === void 0 || !selfColors[idx].includes('#');
      return bool ? v : selfColors[idx];
    });
    return finalColor;
  } else {
    return selfColors;
  }
}

// Y轴科学计数法
export function useScientificNotation(yAxis: YAXisComponentOption) {
  const y = cloneDeep(yAxis);
  const formatter = y.axisLabel!.formatter as string;
  if (/pow/i.test(formatter)) {
    const s = parseInt(formatter.match(/\d+/i)![0]);
    y.axisLabel!.formatter = (v) => {
      return v / Math.pow(10, s);
    };
    y.name = `10e${s}${y.name}`;
    y.axisLine!.symbol = ['none', 'arrow'];
  }
  return y;
}

interface setSeriesInfoParams {
  info: seriesSettingType;
  chartConfig: chartConfigType;
  seriesInfo: any;
  options: EChartsOption;
}
// 输出series信息
export function setSeriesInfo({ info, chartConfig, seriesInfo, options }: setSeriesInfoParams) {
  // 匹配rgb中的数字部分,线就是stroke，填充就是fill
  const style = seriesInfo.event.target.style;
  const colorStr: string =
    style.stroke ?? (isObject(style.fill) ? style.fill.colorStops[0].color : style.fill);
  const color: number[] = colorStr
    .match(/\d+/g)!
    .slice(0, 3)
    .map((v) => parseInt(v));
  info.color = rgbToHex.apply(null, color);
  const { offsetX, offsetY } = seriesInfo.event;
  const [xValue, yValue] = (seriesInfo.instance as EChartsType).convertFromPixel(
    { seriesIndex: seriesInfo.seriesIndex },
    [offsetX, offsetY],
  );

  function caseNormal() {
    const seriesIndex = seriesInfo.seriesIndex;
    const series = options.series![seriesIndex];
    info.name = series.name;
    info.legendName = chartConfig.seriesSetting.find((ser) => ser.name === series.name)?.legendName;
    if (series.type === 'line') {
      if (has(series, 'areaStyle')) {
        info.seriesType = echartSeriesTypeEnum.area;
      } else if (series.smooth === true) {
        info.seriesType = echartSeriesTypeEnum.smoothLine;
      } else if (series.smooth === false) {
        info.seriesType = echartSeriesTypeEnum.line;
      }
      info.size = series.lineStyle.width;
      info.lineType = series.lineStyle.type;
      info.shadow = series.lineStyle.shadowColor !== void 0;
      info.symbol = series.symbol !== 'none';
    } else if (series.type === 'bar') {
      info.seriesType = echartSeriesTypeEnum.bar;
    }
    info.yAxisIndex = series.yAxisIndex + 1;
    info.xAxisIndex = series.xAxisIndex + 1;
    info.currentPoint = [formatToDate(xValue)];
  }
  function caseSeasonal() {
    const seriesIndex = seriesInfo.seriesIndex;
    const series = options.series![seriesIndex];
    info.name = series.name;
    info.legendName = chartConfig.seriesSetting.find((ser) => ser.name === series.name)?.legendName;
    if (series.type === 'line') {
      if (has(series, 'areaStyle')) {
        info.seriesType = echartSeriesTypeEnum.area;
      } else if (series.smooth === true) {
        info.seriesType = echartSeriesTypeEnum.smoothLine;
      } else if (series.smooth === false) {
        info.seriesType = echartSeriesTypeEnum.line;
      }
      info.size = series.lineStyle.width;
      info.lineType = series.lineStyle.type;
      info.shadow = series.lineStyle.shadowColor !== void 0;
      info.symbol = series.symbol !== 'none';
    } else if (series.type === 'bar') {
      info.seriesType = echartSeriesTypeEnum.bar;
    }
    info.yAxisIndex = (series.yAxisIndex ?? 0) + 1;
    info.xAxisIndex = (series.xAxisIndex ?? 0) + 1;
    info.currentPoint = [formatToDate(xValue, 'MM/DD')];
  }
  function caseBar() {
    const seriesIndex = seriesInfo.seriesIndex;
    const series = options.series![seriesIndex];
    info.name = series.name;
    info.legendName = chartConfig.seriesSetting.find((ser) => ser.name === series.name)?.legendName;
    if (series.type === 'line') {
      if (has(series, 'areaStyle')) {
        info.seriesType = echartSeriesTypeEnum.area;
      } else if (series.smooth === true) {
        info.seriesType = echartSeriesTypeEnum.smoothLine;
      } else if (series.smooth === false) {
        info.seriesType = echartSeriesTypeEnum.line;
      }
      info.size = series.lineStyle.width;
      info.lineType = series.lineStyle.type;
      info.shadow = series.lineStyle.shadowColor !== void 0;
    } else if (series.type === 'bar') {
      info.seriesType = echartSeriesTypeEnum.bar;
      info.shadow = false;
    }
    info.yAxisIndex = (series.yAxisIndex ?? 0) + 1;
    info.xAxisIndex = (series.xAxisIndex ?? 0) + 1;
    info.currentPoint = [xValue.toString()];
  }
  function caseStructral() {
    const seriesIndex = seriesInfo.seriesIndex;
    const series = options.series![seriesIndex];
    info.name = series.name;
    info.legendName = chartConfig.seriesSetting.find((ser) => ser.name === series.name)?.legendName;
    if (series.type === 'line') {
      if (has(series, 'areaStyle')) {
        info.seriesType = echartSeriesTypeEnum.area;
      } else if (series.smooth === true) {
        info.seriesType = echartSeriesTypeEnum.smoothLine;
      } else if (series.smooth === false) {
        info.seriesType = echartSeriesTypeEnum.line;
      }
      info.size = series.lineStyle.width;
      info.lineType = series.lineStyle.type;
      info.shadow = series.lineStyle.shadowColor !== void 0;
      info.symbol = series.symbol !== 'none';
    } else if (series.type === 'bar') {
      info.seriesType = echartSeriesTypeEnum.bar;
    }
    info.yAxisIndex = series.yAxisIndex + 1;
    info.xAxisIndex = series.xAxisIndex + 1;
  }
  function caseRadar() {
    const dataIndex = seriesInfo.dataIndex;
    const data = options.series![0].data[dataIndex];
    info.name = data.name;
    info.legendName = chartConfig.seriesSetting.find((ser) => ser.name === data.name)?.legendName;
    info.seriesType = echartSeriesTypeEnum.radar;
    info.size = data.lineStyle.width;
    info.lineType = data.lineStyle.type;
    info.shadow = data.lineStyle.shadowColor !== void 0;
    info.symbol = data.symbol !== 'none';
  }
  const fns = {
    [chartTypeEnum.normal]: caseNormal,
    [chartTypeEnum.seasonal]: caseSeasonal,
    [chartTypeEnum.structural]: caseStructral,
    [chartTypeEnum.bar]: caseBar,
    [chartTypeEnum.normalRadar]: caseRadar,
    [chartTypeEnum.quantileRadar]: caseRadar,
  };
  return fns[chartConfig.type as keyof typeof fns].call(null);
}

export function conver2ecSeriesType(echartSeriesType: echartSeriesTypeEnum) {
  const typeMap = {
    [echartSeriesTypeEnum.line]: 'line',
    [echartSeriesTypeEnum.smoothLine]: 'line',
    [echartSeriesTypeEnum.area]: 'line',
    [echartSeriesTypeEnum.scatter]: 'scatter',
    [echartSeriesTypeEnum.bar]: 'bar',
    [echartSeriesTypeEnum.radar]: 'radar',
    [echartSeriesTypeEnum.pie]: 'pie',
  };
  return typeMap[echartSeriesType] as 'line' | 'scatter' | 'bar' | 'radar' | 'pie';
}

// 设置series更多配置
export function useSeriesSetting({
  chartConfig,
  options,
}: {
  options: EChartsOption;
  chartConfig: chartConfigType;
}) {
  const series = options.series as SeriesOption[];
  const seriesSettings = chartConfig.seriesSetting;
  function getAxisIndex(seriesSetting?: seriesSettingType) {
    return {
      xAxisIndex: seriesSetting?.xAxisIndex ?? 0,
      yAxisIndex: seriesSetting?.yAxisIndex ?? 0,
    };
  }
  // 一份series的样式
  function getSeriesStyle({
    ser,
    seriesSetting,
    index,
  }: {
    ser: SeriesOption;
    seriesSetting?: seriesSettingType;
    index: number;
  }) {
    if (ser.type === 'line') {
      // 线性
      const lineStyle = {
        width: seriesSetting?.size ?? 2,
        type: seriesSetting?.lineType ?? echartLineTypeEnum.solid,
      };
      const smooth = seriesSetting?.seriesType === echartSeriesTypeEnum.smoothLine;
      if (seriesSetting?.shadow) {
        Object.assign(lineStyle, {
          shadowBlur: 3,
          shadowColor: options.color![index] ?? '#000',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        });
      }
      if (seriesSetting?.seriesType === echartSeriesTypeEnum.area) {
        return {
          smooth,
          symbol: 'none',
          lineStyle,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: options.color![index] ?? '#ffffff66',
                },
                {
                  offset: 1,
                  color: fade(options.color![index] ?? '#ffffff66', 30),
                },
              ],
            },
          },
        };
      }
      return {
        lineStyle,
        smooth,
        symbolSize: (seriesSetting?.size ?? 4) + 2,
        symbol:
          chartConfig.type === chartTypeEnum.structural
            ? seriesSetting?.symbol ?? true
              ? 'emptyCircle'
              : 'none'
            : seriesSetting?.symbol
            ? 'emptyCircle'
            : 'none',
      };
    }
    if (ser.type === 'bar') {
      // 柱状图
      const barStyle = {
        label: {
          show: true,
          position: 'outside',
        },
      };
      return {
        ...barStyle,
      };
    }
    if (ser.type === 'radar') {
      const lineStyle = {
        width: seriesSetting?.size ?? 2,
        type: seriesSetting?.lineType ?? echartLineTypeEnum.solid,
      };
      if (seriesSetting?.shadow) {
        Object.assign(lineStyle, {
          shadowBlur: 3,
          shadowColor: options.color![index] ?? '#000',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        });
      }
      if (seriesSetting?.seriesType === echartSeriesTypeEnum.area) {
        return {
          symbol: 'none',
          lineStyle,
          areaStyle: {
            color: {
              type: 'radial',
              x: 0,
              y: 0,
              r: 1,
              colorStops: [
                {
                  offset: 0,
                  color: options.color![index] ?? '#ffffff66',
                },
                {
                  offset: 1,
                  color: fade(options.color![index] ?? '#ffffff66', 10),
                },
              ],
            },
          },
        };
      }
      return {
        lineStyle,
        symbolSize: (seriesSetting?.size ?? 4) + 2,
        symbol: seriesSetting?.symbol ? 'circle' : 'none',
      };
    }
  }
  const typeMap = {
    [chartTypeEnum.normal]: () => {
      series.forEach((s) => {
        const index = series.findIndex((ser) => ser.name === s.name);
        const seriesSetting = seriesSettings.find((q) => q.name === s.name);
        s.type = conver2ecSeriesType(seriesSetting?.seriesType ?? echartSeriesTypeEnum.line);
        Object.assign(s, {
          triggerLineEvent: true,
          ...getSeriesStyle({ ser: s, seriesSetting, index }),
          ...getAxisIndex(seriesSetting),
        });
      });
    },
    [chartTypeEnum.seasonal]: () => {
      series.forEach((s, index) => {
        const seriesSetting = seriesSettings.find((q) => q.name === s.name);
        s.type = conver2ecSeriesType(seriesSetting?.seriesType ?? echartSeriesTypeEnum.line);
        Object.assign(s, {
          triggerLineEvent: true,
          ...getSeriesStyle({ ser: s, seriesSetting, index }),
          ...getAxisIndex(seriesSetting),
        });
      });
    },
    [chartTypeEnum.structural]: () => {
      series.forEach((s, index) => {
        const seriesSetting = seriesSettings.find((q) => q.name === s.name);
        s.type = conver2ecSeriesType(seriesSetting?.seriesType ?? echartSeriesTypeEnum.line);
        Object.assign(s, {
          triggerLineEvent: true,
          ...getSeriesStyle({ ser: s, seriesSetting, index }),
          ...getAxisIndex(seriesSetting),
        });
      });
    },
    [chartTypeEnum.bar]: () => {
      series.forEach((s, index) => {
        const seriesSetting = seriesSettings.find((q) => q.name === s.name);
        s.type = conver2ecSeriesType(seriesSetting?.seriesType ?? echartSeriesTypeEnum.bar);
        Object.assign(s, {
          triggerLineEvent: true,
          ...getSeriesStyle({ ser: s, seriesSetting, index }),
          ...getAxisIndex(seriesSetting),
        });
      });
    },
    [chartTypeEnum.normalRadar]: () => {
      (series[0].data as any[]).forEach((s, index) => {
        const seriesSetting = seriesSettings.find((q) => q.name === s.name);
        s.type = conver2ecSeriesType(seriesSetting?.seriesType ?? echartSeriesTypeEnum.radar);
        Object.assign(s, {
          triggerLineEvent: true,
          ...getSeriesStyle({ ser: s, seriesSetting, index }),
        });
      });
    },
    [chartTypeEnum.quantileRadar]: () => {
      (series[0].data as any[]).forEach((s) => {
        const index = series.findIndex((ser) => ser.name === s.name);
        const seriesSetting = seriesSettings.find((q) => q.name === s.name);
        s.type = conver2ecSeriesType(seriesSetting?.seriesType ?? echartSeriesTypeEnum.radar);
        Object.assign(s, {
          triggerLineEvent: true,
          ...getSeriesStyle({ ser: s, seriesSetting, index }),
        });
      });
    },
    [chartTypeEnum.pie]: () => {},
    [chartTypeEnum.seasonalLunar]: () => {},
  };
  return typeMap[chartConfig.type as keyof typeof typeMap].call(null);
}

export function useLegendName({
  chartConfig,
  options,
}: {
  options: EChartsOption;
  chartConfig: chartConfigType;
}) {
  const { seriesSetting } = chartConfig;
  (options.legend! as LegendComponentOption).formatter = (name: string) => {
    return seriesSetting?.find((q) => q.name === name)?.legendName ?? name;
  };
  (options.grid! as GridComponentOption).tooltip.formatter = (name: string) => {
    return seriesSetting?.find((q) => q.name === name)?.legendName ?? name;
  };
}

export function useRemovePoint({
  chartConfig,
  quotaDataList,
}: {
  chartConfig: normalChartConfigType;
  quotaDataList: getQuotaDataResult[];
}) {
  const rules = chartConfig.removePoint;
  if (rules !== void 0 && rules.length > 0) {
    const filterSeries: { [key: string]: string[] } = {};
    rules?.forEach((item) => {
      const range = item.xRange.split(',');
      filterSeries[item.seriesName] = range;
    });
    if (rules === void 0 || rules.length === 0) return;
    quotaDataList.forEach((quota) => {
      if (Reflect.has(filterSeries, quota.name)) {
        const r = filterSeries[quota.name].map((item) => {
          // 等于某日期
          if (/x=\d{4}-\d{2}-\d{2}/i.test(item)) {
            return toTimeStamp(item.split('=')[1]) * 1000;
          }
          // 大于某日期,小于某日期
          if (/\d{4}-\d{2}-\d{2}<x<\d{4}-\d{2}-\d{2}/i.test(item)) {
            return item.split('<x<').map((s) => toTimeStamp(s) * 1000);
          }
        });
        if (r.length > 0) {
          quota.data = quota.data.filter((data) => {
            const time = dateUtil(data[0]).startOf('d').unix() * 1000;
            for (let i = 0; i < r.length; i++) {
              const s = r[i];
              if (isNumber(s) && s === time) return false;
              if (isArray(s) && time > s[0] && time < s[1]) return false;
            }
            return true;
          });
        }
      }
    });
  }
}
