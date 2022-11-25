import { BasicColumn } from '/@/components/Table/src/types/table';

export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: '名称',
      dataIndex: 'specialName',
    },
    {
      title: '创建者',
      dataIndex: 'userName',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      title: '数据类别',
      dataIndex: 'specialType',
    },
  ];
}
