import { getOptionsDataList } from '@dq-next/http-apis/special/index';
import { FormSchema } from '/@/components/Form/index';
import { formatToDate, yearsAgo } from '@dq-next/utils/dateUtil';
const startDate = yearsAgo(6);
const endDate = formatToDate();
export const schemas: FormSchema[] = [
  {
    field: 'products',
    component: 'ApiSelect',
    label: 'Product',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: ({ formActionType }) => {
      return {
        mode: 'multiple',
        maxTagCount: 2,
        api: async function () {
          const list: any = await getOptionsDataList({
            column: 'product',
            key: '',
            values: '{}',
          });
          return list.map((item) => {
            return {
              label: item,
              value: item,
              key: item,
            };
          });
        },
        onChange: function (e) {
          console.log(e);
          const { updateSchema } = formActionType;
          const requestList = ['unit', 'balance'];
          for (let i = 0; i < requestList.length; i++) {
            getOptionsDataList({
              column: requestList[i],
              key: 'product',
              values: JSON.stringify(e),
            }).then((list: any) => {
              updateSchema({
                field: requestList[i],
                componentProps: {
                  options: list.map((item) => {
                    return {
                      label: item,
                      value: item,
                    };
                  }),
                },
              });
            });
          }
        },
      };
    },
  },
  {
    field: 'unit',
    component: 'ApiSelect',
    label: 'Unit',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    rules: [
      {
        required: true,
        message: '请选择unit',
        type: 'string',
      },
    ],
    componentProps: {
      api: async function () {
        const list: any = await getOptionsDataList({ column: 'unit', key: '', values: '{}' });
        return list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'balance',
    component: 'ApiSelect',
    label: 'Balance',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    rules: [
      {
        required: true,
        message: '请选择balance',
        type: 'string',
      },
    ],
    componentProps: {
      api: async function () {
        const list: any = await getOptionsDataList({
          column: 'balance',
          key: '',
          values: '{}',
        });
        return list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'region',
    component: 'ApiSelect',
    label: 'Region',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    componentProps: {
      mode: 'multiple',
      maxTagCount: 1,
      api: async function () {
        const list: any = await getOptionsDataList({
          column: 'region',
          key: '',
          values: '{}',
        });
        return list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'country',
    component: 'ApiSelect',
    label: 'Country',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    componentProps: {
      mode: 'multiple',
      maxTagCount: 1,
      api: async function () {
        const list: any = await getOptionsDataList({
          column: 'country',
          key: '',
          values: '{}',
        });
        return list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'timeRange',
    component: 'RangePicker',
    label: 'Date',
    colProps: {
      span: 6,
    },
    componentProps: ({ formModel }) => {
      formModel.timeRange = [startDate, endDate];
      return {
        style: {
          width: '100%',
        },
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
        allowClear: false,
      };
    },
  },
  {
    field: 'group_dt',
    component: 'Select',
    label: 'Group Time',
    colProps: {
      span: 6,
    },
    componentProps: {
      options: [
        {
          label: 'Month',
          value: 'month',
          key: '1',
        },
        {
          label: 'Year',
          value: 'year',
          key: '2',
        },
        {
          label: 'Year%',
          value: '3',
          key: '3',
        },
      ],
    },
  },
  {
    field: 'group_district',
    component: 'Select',
    label: 'Group Area',
    colProps: {
      span: 6,
    },
    componentProps: {
      options: [
        {
          label: 'Region',
          value: 'region',
          key: '1',
        },
        {
          label: 'Country',
          value: 'country',
          key: '2',
        },
      ],
    },
  },
  {
    field: 'chart_title',
    component: 'Input',
    label: 'Chart Title',
    colProps: {
      span: 6,
    },
  },
  {
    field: 'sum_type',
    component: 'RadioGroup',
    label: 'Sum Type',
    colProps: {
      span: 6,
    },
    defaultValue: 'cumu_sum',
    componentProps: {
      options: [
        {
          label: '累计求和',
          value: 'cumu_sum',
        },
        {
          label: '当月求和',
          value: 'month_sum',
        },
      ],
    },
  },
  {
    field: 'chart_type',
    component: 'RadioGroup',
    label: 'Chart Type',
    colProps: {
      span: 6,
    },
    defaultValue: 'seasonal',
    componentProps: {
      options: [
        {
          label: '季节性序列',
          value: 'seasonal',
        },
        {
          label: '时间序列',
          value: 'normal',
        },
      ],
    },
  },
];
