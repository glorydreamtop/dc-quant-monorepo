import { BasicColumn } from '/@/components/Table/src/types/table';

export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: '品种',
      dataIndex: 'comm',
      // slots: { customRender: 'memberLink' },
      fixed: 'left',
    },
    {
      title: '现货价格名称',
      dataIndex: 'name',
    },
    {
      title: '主力合约代码',
      dataIndex: 'code1',
    },
    {
      title: '现货价格',
      dataIndex: 'p0',
      sorter: (a, b) => a.p0 - b.p0,
    },
    {
      title: '基差',
      dataIndex: 'ba',
      sorter: (a, b) => a.ba - b.ba,
    },
    {
      title: '基差率(%)',
      dataIndex: 'ba_r',
      sorter: (a, b) => a.ba_r - b.ba_r,
    },
    {
      title: '月差率(%)',
      dataIndex: 'p12_r',
      sorter: (a, b) => a.p12_r - b.p12_r,
    },
    {
      title: '年化基差率(%)',
      dataIndex: 'ba_ra',
      sorter: (a, b) => a.ba_ra - b.ba_ra,
    },
    {
      title: '年化月差率(%)',
      dataIndex: 'p12_ra',
      sorter: (a, b) => a.p12_ra - b.p12_ra,
    },
    {
      title: '现货变动',
      dataIndex: 'p0_chg',
      sorter: (a, b) => a.p0_chg - b.p0_chg,
    },
    {
      title: '基差变动',
      dataIndex: 'ba_chg',
      sorter: (a, b) => a.ba_chg - b.ba_chg,
    },
    {
      title: '基差率同比(%)',
      dataIndex: 'ba_r_yoy',
    },
    {
      title: '基差率年化同比(%)',
      dataIndex: 'ba_ra_yoy',
    },
    {
      title: '月差率同比(%)',
      dataIndex: 'p12_r_yoy',
    },
    {
      title: '月差率年化同比(%)',
      dataIndex: 'p12_ra_yoy',
    },
    {
      title: '基差率环比(%)',
      dataIndex: 'ba_r_mom',
    },
    {
      title: '基差率年化环比(%)',
      dataIndex: 'ba_ra_mom',
    },
    {
      title: '月差率环比(%)',
      dataIndex: 'p12_r_mom',
    },
    {
      title: '月差率年化环比(%)',
      dataIndex: 'p12_ra_mom',
    },
  ];
}
