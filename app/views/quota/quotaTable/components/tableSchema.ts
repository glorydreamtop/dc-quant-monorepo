import { ref } from 'vue';
import { TableConfigType } from '/#/table';

export interface TableConfigSchema extends TableConfigType {
  name: string;
  preview: string;
}

export const tableConfigSchemaList = ref<TableConfigSchema[]>([
  {
    title: '',
    preview: 'https://img.shducheng.net/cms/downloadFile?fileKey=files/table1.png',
    name: '最新两期差值',
    columns: [
      { title: '分类', field: 'a' },
      { title: '指标名称', field: 'b' },
      { title: '前值', field: 'c' },
      { title: '最新值', field: 'd' },
      { title: '变化', field: 'e' },
    ],
    data: [
      {
        a: '-',
        b: '-',
        c: '-',
        d: '-',
        e: '-',
      },
      {
        a: '-',
        b: '-',
        c: '-',
        d: '-',
        e: '-',
      },
      {
        a: '-',
        b: '-',
        c: '-',
        d: '-',
        e: '-',
      },
      {
        a: '-',
        b: '-',
        c: '-',
        d: '-',
        e: '-',
      },
      {
        a: '-',
        b: '-',
        c: '-',
        d: '-',
        e: '-',
      },
    ],
  },
]);
