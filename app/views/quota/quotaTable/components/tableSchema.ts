import { ref } from 'vue';
import { TableConfigType } from '/#/table';
import { formatToDate } from '@dq-next/utils/dateUtil';

export interface TableConfigSchema extends TableConfigType {
  name: string;
  preview: string;
}

export const tableConfigSchemaList = ref<TableConfigSchema[]>([
  {
    title: '',
    preview: 'https://img.shducheng.net/cms/downloadFile?fileKey=files/table1.png',
    name: '最新两期差值',
    timeConfig: {
      endDate: formatToDate(),
    },
    columns: [
      { title: '分类', field: 'a', headerType: 0, timeStr: '' },
      { title: '指标名称', field: 'b', headerType: 0, timeStr: '' },
      { title: '前值', field: 'c', headerType: 1, timeStr: '-1' },
      { title: '最新值', field: 'd', headerType: 1, timeStr: '0' },
      { title: '变化', field: 'e', headerType: 0, timeStr: '' },
    ],
    data: [
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '指标名称',
          type: 0,
        },
        c: {
          val: '指标ID',
          type: 1,
        },
        d: {
          val: '指标ID',
          type: 1,
        },
        e: {
          val: '-',
          type: 2,
        },
      },
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '指标名称',
          type: 0,
        },
        c: {
          val: '指标ID',
          type: 1,
        },
        d: {
          val: '指标ID',
          type: 1,
        },
        e: {
          val: '-',
          type: 2,
        },
      },
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '指标名称',
          type: 0,
        },
        c: {
          val: '指标ID',
          type: 1,
        },
        d: {
          val: '指标ID',
          type: 1,
        },
        e: {
          val: '-',
          type: 2,
        },
      },
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '指标名称',
          type: 0,
        },
        c: {
          val: '指标ID',
          type: 1,
        },
        d: {
          val: '指标ID',
          type: 1,
        },
        e: {
          val: '-',
          type: 2,
        },
      },
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '指标名称',
          type: 0,
        },
        c: {
          val: '指标ID',
          type: 1,
        },
        d: {
          val: '指标ID',
          type: 1,
        },
        e: {
          val: '-',
          type: 2,
        },
      },
    ],
  },
  {
    title: '',
    preview: 'https://img.shducheng.net/cms/downloadFile?fileKey=files/table4.png',
    name: '空白5行5列',
    timeConfig: {
      endDate: formatToDate(),
    },
    columns: [
      { title: '列a', field: 'a', headerType: 0, timeStr: '' },
      { title: '列b', field: 'b', headerType: 0, timeStr: '' },
      { title: '列c', field: 'c', headerType: 0, timeStr: '' },
      { title: '列d', field: 'd', headerType: 0, timeStr: '' },
      { title: '列e', field: 'e', headerType: 0, timeStr: '' },
    ],
    data: [
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '-',
          type: 0,
        },
        c: {
          val: '-',
          type: 0,
        },
        d: {
          val: '-',
          type: 0,
        },
        e: {
          val: '-',
          type: 0,
        },
      },
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '-',
          type: 0,
        },
        c: {
          val: '-',
          type: 0,
        },
        d: {
          val: '-',
          type: 0,
        },
        e: {
          val: '-',
          type: 0,
        },
      },
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '-',
          type: 0,
        },
        c: {
          val: '-',
          type: 0,
        },
        d: {
          val: '-',
          type: 0,
        },
        e: {
          val: '-',
          type: 0,
        },
      },
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '-',
          type: 0,
        },
        c: {
          val: '-',
          type: 0,
        },
        d: {
          val: '-',
          type: 0,
        },
        e: {
          val: '-',
          type: 0,
        },
      },
      {
        a: {
          val: '-',
          type: 0,
        },
        b: {
          val: '-',
          type: 0,
        },
        c: {
          val: '-',
          type: 0,
        },
        d: {
          val: '-',
          type: 0,
        },
        e: {
          val: '-',
          type: 0,
        },
      },
    ],
  },
]);
