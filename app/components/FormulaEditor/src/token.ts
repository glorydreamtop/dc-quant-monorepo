export const fnMap = {
  idx: {
    value: 'idx()',
    endOffset: 4,
    tip: '指标',
  },
  _idx: {
    value: 'idx(#id#)',
    endOffset: 4,
    tip: '指标',
  },
  grow: {
    value: 'grow()',
    endOffset: 5,
    tip: '环比',
  },
  yoy: {
    value: 'yoy()',
    endOffset: 4,
    tip: '同比',
  },
  diff: {
    value: 'diff()',
    endOffset: 5,
    tip: '差值',
  },
  rtn: {
    value: 'rtn()',
    endOffset: 4,
    tip: '收益',
  },
  lag: {
    value: 'lag()',
    endOffset: 4,
    tip: '按期偏移',
  },
  offset: {
    value: 'offset()',
    endOffset: 7,
    tip: '按时间偏移',
  },
  sum: {
    value: 'sum()',
    endOffset: 4,
    tip: '滚动求和',
  },
  smax: {
    value: 'smax[]',
    endOffset: 5,
    tip: '最大',
  },
  smin: {
    value: 'smin[]',
    endOffset: 5,
    tip: '最小',
  },
  normalize: {
    value: 'normalize()',
    endOffset: 10,
    tip: '归一',
  },
  trans: {
    value: 'trans()',
    endOffset: 6,
    tip: '变频',
  },
  sum_acc: {
    value: 'sum_acc()',
    endOffset: 8,
    tip: '滚动累加',
  },
  ma: {
    value: 'ma()',
    endOffset: 3,
    tip: '移动平均',
  },
  var: {
    value: 'var()',
    endOffset: 4,
    tip: '滚动方差',
  },
  std: {
    value: 'std()',
    endOffset: 4,
    tip: '滚动标准差',
  },
  ptc: {
    value: 'ptc()',
    endOffset: 4,
    tip: '百分位数',
  },
  zscore: {
    value: 'zscore()',
    endOffset: 7,
    tip: '滚动标准分',
  },
  month_days: {
    value: 'month_days()',
    endOffset: 11,
    tip: '当月天数',
  },
  table_query: {
    value: 'table_query()',
    endOffset: 12,
    tip: '量化表查询',
  },
};
