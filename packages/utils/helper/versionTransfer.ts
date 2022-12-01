import { YAXisComponentOption } from 'echarts';
import { difference, omit } from 'lodash-es';
import {
  barChartConfigType,
  chartConfigType,
  normalChartConfigType,
  quantileRadarChartConfigType,
  seasonalChartConfigType,
  structuralChartConfigType,
} from '/#/chart';
import { quotaDataPastUnitTypeEnum } from '@dq-next/http-apis/quota';
import {
  chartTypeEnum,
  structuralOffsetUnitEnum,
  timeConfigEnum,
  versionEnum,
} from '/@/enums/chartEnum';
import { formatToDate } from '../dateUtil';
import { SelectedQuotaItem } from '/@/views/quota/quotaView/components/hooks';
import { TemplateItem } from '/#/template';
import { TreeItem } from '/@/components/Tree';

interface chartTemplateModel {
  config: chartConfigType;
  category_id: number;
}

export function pingChart() {
  // 图表颜色列表
  const chart_colors_list = [
    {
      name: '默认配色',
      colors: [
        '#85c1e9',
        '#b2b4c3',
        '#1f74ad',
        '#ee8f71',
        '#a5251c',
        '#f15c80',
        '#e4d354',
        '#8085e8',
        '#8d4653',
        '#91e8e1',
      ],
    },
    {
      name: 'Hichart配色',
      colors: [
        '#7cb5ec',
        '#90ed7d',
        '#f7a35c',
        '#8085e9',
        '#f15c80',
        '#e4d354',
        '#8085e8',
        '#8d4653',
        '#91e8e1',
      ],
    },
    {
      name: 'MX Gray', // 明 曦灰
      colors: ['#bdbdbd', '#747474', '#bd9c5e', '#d2826d', '#731714'],
    },
    {
      name: 'MX Blue', // 明 曦蓝
      colors: ['#bdbdbd', '#75b9e6', '#003661', '#eb815f'],
    },
    {
      name: '碧海蓝天', // http://www.sohu.com/a/148389742_417040
      colors: ['#0f6fc6', '#009dd9', '#0bd0d9', '#eb815f', '#7cca62', '#f49100'],
    },
    {
      name: '数据蓝灰', // http://www.sohu.com/a/148389742_417040
      colors: ['#2a3d52', '#c4af99', '#5b6c83', '#d7ccb8', '#38526e', '#bfbfbf'],
    },
    {
      name: '安全色', // http://www.sohu.com/a/148389742_417040
      colors: ['#e6836d', '#2a3d52', '#bfbfbf', '#a5c3c3', '#dcd0a8', '#a1797f', '#0b81c9'],
    },
    {
      name: '热季风', // http://www.sohu.com/a/148389742_417040
      colors: ['#a53005', '#e19825', '#d55816', '#b18c7d', '#7f5f52', '#b27d49'],
    },
    {
      name: '清淡色',
      colors: [
        '#bfbfbf',
        '#dcd0a8',
        '#91e8e1',
        '#e4d354',
        '#91e8e1',
        '#85c1e9',
        '#8085e8',
        '#a1797f',
      ],
    },
  ];

  // 图表类型对应
  const chart_types_map = {
    series: 'normal', //数据序列
    season: 'seasonal', //季节性序列
    curve: 'structural', //曲线结构
    polar_quantile: 'quantile', //雷达图(分位数)
    polar: 'radar', //雷达图
    pie: 'pie', // 饼图
    column: 'bar', //柱状图
    boxplot: 'boxplot', // 箱线图
    datatable: '', // '数据表格'
  };

  // 线形类型对应
  const line_types_map = {
    line: 'line',
    spline: 'smoothLine',
    area: 'area',
    column: 'bar',
    bar: 'bar',
    pie: 'line',
    treemap: 'line',
    scatter: 'scatter',
  };

  return function transform(options) {
    const rows = options['rows'];
    const o: chartTemplateModel = {
      category_id: options['category_id'],
      config: {
        name: options['template_name'],
        type: chart_types_map[options['option_template_type']],
        title: options['chart_title'],
        quotaList: [],
        seriesSetting: [],
        colorSchemeId: 22,
        selfColorScheme: chart_colors_list[options['option_chart_color']]['colors'].join(','),
        valueFormatter: {
          normalized: options['option_normalize'],
          afterDot: 2,
          sortMonth: [],
        },
        showLastest: true,
        showHighest: false,
        timeConfig: {
          startDate: '2015-01-01',
          endDate: formatToDate(),
          type: timeConfigEnum.default,
        },
        yAxis: [],
        xAxis: [
          {
            min: undefined,
            max: undefined,
            inverse: false,
            name: '下1',
            offset: 0,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#999999',
              },
            },
            position: 'bottom',
            axisLabel: {
              formatter: '{yyyy}/{M}/{d}',
            },
          },
        ],
        http: true,
        fixData: [],
      } as unknown as chartConfigType,
    };

    if (o.config.type == 'seasonal') {
      // 季节性
      const b = options['season_begin_month'] ? +options['season_begin_month'] : 1;
      o.config.timeConfig.startMonth = b;
      const all = new Array(12).map((_, i) => i + 1);
      const l =
        options['season_months'] && options['season_months'].length > 0
          ? options['season_months']
          : new Array(12).map((_, i) => i + 1);
      o.config.timeConfig.sortMonth = difference(all, l);
    } else if (o.config.type == 'structural') {
      // 结构曲线
      (o.config as structuralChartConfigType).structuralOffset = '30,15,7,1,0';
      (o.config as structuralChartConfigType).structuralOffsetUnit =
        structuralOffsetUnitEnum.natureDay;
    } else if (o.config.type == 'quantileRadar') {
      // 分位数
      const l =
        options['quantile_years'] && options['quantile_years'].length > 0
          ? options['quantile_years']
          : [1, 3, 5, 10];
      (o.config as quantileRadarChartConfigType).quantileOffset = l.join(',');
    } else if (['radar', 'bar'].includes(o.config.type)) {
      o.config.timeConfig.pastValue = 3;
      o.config.timeConfig.pastUnit = quotaDataPastUnitTypeEnum.last;
    } else if (o.config.type === 'pie') {
      o.config.timeConfig.pastValue = 1;
      o.config.timeConfig.pastUnit = quotaDataPastUnitTypeEnum.last;
    }

    let yaxis_list: YAXisComponentOption[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (Reflect.has(row, 'formula')) {
        Reflect.deleteProperty(row, 'formula');
      }
      //Y轴处理
      if (row['yaxis'] == 1 || row['yaxis'] == 2) {
        yaxis_list =
          yaxis_list.length > 0
            ? yaxis_list
            : [
                {
                  position: 'left',
                  max: undefined,
                  min: undefined,
                  offset: 0,
                  inverse: false,
                  axisLabel: { formatter: '{value}' },
                },
              ];
        yaxis_list.push({
          position: 'right',
          min: !row['ymin'] ? undefined : +row['ymin'],
          max: !row['ymax'] ? undefined : +row['ymax'],
          offset: 0,
          inverse: row['yaxis'] == 2,
          axisLabel: { formatter: '{value}' },
        });
      }
      if (row.id && row.id > 100000000) {
        Reflect.deleteProperty(row, 'id');
      }
      o.config.quotaList?.push({
        name: row['name'],
        sourceCode: row['source_code'],
        sourceType: row['source_type'],
        dateLast: row['date_first'],
        frequency: row['frequency'],
        unit: row['unit'],
        shortName: row['shortName'],
        selected: true,
        id: row.id,
        timeLastUpdate: '',
      });
      o.config.seriesSetting.push({
        seriesType: line_types_map[row['chart_type']],
        yAxisIndex: row['yaxis'] == 1 || row['yaxis'] == 2 ? yaxis_list.length - 1 : 0,
        size: 2,
        name: row['name'],
      });
    }

    //Y轴设置
    (o.config as normalChartConfigType | seasonalChartConfigType | barChartConfigType).yAxis =
      yaxis_list.length > 0
        ? yaxis_list
        : [
            {
              inverse: false,
              offset: 0,
              position: 'left',
              axisLabel: { formatter: '{value}' },
            },
          ];
    return o.config;
  };
}

export function huiChart() {
  return function transform(options) {
    const o = options.config;
    const config: chartConfigType = {
      title: o.title,
      name: o.title,
      type: o.type,
      colorSchemeId: o.colorsId,
      selfColorScheme: o.colors,
      showLastest: o.textRect.showLastest,
      showHighest: o.textRect.showHighest,
      timeConfig: {
        startDate: o.startDate,
        endDate: o.endDate,
        type: o.timeType,
      },
      valueFormatter: {
        afterDot: o.decimal,
        normalized: o.normalized,
      },
      yAxis: o.multiY
        ? o.yAxis.map((y) => ({ ...y, axisLabel: { formatter: '{value}' } }))
        : [
            {
              inverse: false,
              offset: 0,
              position: 'left',
              axisLabel: { formatter: '{value}' },
            },
          ],
      xAxis: [
        {
          min: undefined,
          max: undefined,
          inverse: false,
          name: '下1',
          offset: 0,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#999999',
            },
          },
          position: 'bottom',
          axisLabel: {
            formatter: '{yyyy}/{M}/{d}',
          },
        },
      ],
      http: o.http || true,
      fixData: o.fixData | [],
    };
    if (o.lastMulti.multi) {
      config.timeConfig.pastValue = o.lastMulti.number;
    }
    if (o.type === chartTypeEnum.pie) {
      config.timeConfig.pastValue = 1;
      config.timeConfig.pastUnit = quotaDataPastUnitTypeEnum.last;
    }
    if (
      [chartTypeEnum.structural, chartTypeEnum.seasonalLunar, chartTypeEnum.bar].includes(o.type)
    ) {
      config.xAxis[0].axisLabel.formatter = '{value}';
    }
    if (o.structXLabel.ifStruct) {
      (config as structuralChartConfigType).structuralOffset = o.structXLabel.list
        .map((item) => item.value)
        .join(',');
      (config as structuralChartConfigType).structuralOffsetUnit =
        structuralOffsetUnitEnum.natureDay;
    }
    if (o.sortMonth.ifSortMonth) {
      const all = new Array(12).map((_, i) => i + 1);
      const l = o.sortMonth.list;
      config.timeConfig.sortMonth = difference(all, l);
    }
    if (o.quantile.ifQuantile) {
      (o.config as quantileRadarChartConfigType).quantileOffset = o.quantile.list
        .map((item) => item.value)
        .join(',');
    }
    config.seriesSetting = [];
    config.quotaList = o.rows.map((row) => {
      const r = omit(row, ['show', 'seriesCfg']) as SelectedQuotaItem;
      r.selected = row.show || row.selected;
      config.seriesSetting.push({
        yAxisIndex: row.seriesCfg.yAxisIndex,
        size: row.seriesCfg.lineWidth,
        seriesType: row.seriesCfg.type,
      });
      return r;
    });

    return config;
  };
}

export function proChart() {
  return function transform(options) {
    return options.config;
  };
}

export function autoVersionTransfer(item: TemplateItem) {
  const { pingChart, huiChart, proChart } = useVersionTransfer();
  const json = JSON.parse(item.options);
  if (Reflect.has(json, 'config') && json.config.version !== 2) {
    item.version = versionEnum.HUIChart;
    item.config = huiChart(json);
    item.name = item.config.name;
  } else if (Reflect.has(json, 'option_template_type')) {
    item.version = versionEnum.PINGChart;
    item.config = pingChart(json);
  } else {
    item.version = versionEnum.PROChart;
    item.config = proChart(json);
    item.name = item.config.title;
  }
  return item;
}

export function useVersionTransfer() {
  return {
    pingChart: pingChart(),
    huiChart: huiChart(),
    proChart: proChart(),
  };
}
