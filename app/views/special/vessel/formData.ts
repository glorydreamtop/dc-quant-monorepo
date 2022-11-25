import { getVesselOptionsDataList } from '@dq-next/http-apis/special/index';
import { FormSchema } from '/@/components/Form/index';
import { formatToDate, yearsAgo } from '@dq-next/utils/dateUtil';
const startDate = yearsAgo(6);
const endDate = formatToDate();
export const schemas: FormSchema[] = [
  {
    field: 'product',
    component: 'ApiSelect',
    label: 'Product',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    rules: [
      {
        required: true,
        message: '请选择至少选择一个Product',
        type: 'array',
      },
    ],
    componentProps: ({ formActionType }) => {
      return {
        mode: 'multiple',
        maxTagCount: 2,
        api: async function () {
          const info: any = await getVesselOptionsDataList(
            {
              key: '',
              values: '[]',
            },
            'product',
          );
          return info.list.map((item) => {
            return {
              label: item,
              value: item,
            };
          });
        },
        onChange: async function (e) {
          console.log(e);
          const { updateSchema } = formActionType;
          const requestList = ['grade'];
          for (let i = 0; i < requestList.length; i++) {
            getVesselOptionsDataList(
              {
                key: 'product',
                values: JSON.stringify(e),
              },
              requestList[i],
            ).then((info: any) => {
              updateSchema({
                field: requestList[i],
                componentProps: {
                  options: info.list.map((item) => {
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
    field: 'grade',
    component: 'ApiSelect',
    label: 'Grade',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: {
      mode: 'multiple',
      maxTagCount: 1,
      api: async function () {
        const info: any = await getVesselOptionsDataList(
          {
            key: '',
            values: '[]',
          },
          'grade',
        );
        return info.list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'departure',
    component: 'RangePicker',
    label: 'Departure',
    colProps: {
      span: 6,
    },
    componentProps: {
      style: {
        width: '100%',
      },
      valueFormat: 'YYYY-MM-DD',
      format: 'YYYY-MM-DD',
      allowClear: true,
    },
  },
  {
    field: 'arrival',
    component: 'RangePicker',
    label: 'Arrival',
    colProps: {
      span: 6,
    },
    componentProps: ({ formModel }) => {
      formModel.arrival = [startDate, endDate];
      return {
        style: {
          width: '100%',
        },
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
        allowClear: true,
      };
    },
  },
  {
    field: 'load_region',
    component: 'ApiSelect',
    label: 'Region',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: ({ formActionType }) => {
      return {
        mode: 'multiple',
        maxTagCount: 2,
        placeholder: 'load region',
        api: async function () {
          const info: any = await getVesselOptionsDataList(
            {
              key: '',
              values: '[]',
            },
            'load_region',
          );
          return info.list.map((item) => {
            return {
              label: item,
              value: item,
            };
          });
        },
        onChange: function (e) {
          console.log(e);
          const { updateSchema } = formActionType;
          const requestList = ['load_country'];
          for (let i = 0; i < requestList.length; i++) {
            getVesselOptionsDataList(
              {
                key: 'load_region',
                values: JSON.stringify(e),
              },
              requestList[i],
            ).then((info: any) => {
              updateSchema({
                field: requestList[i],
                componentProps: {
                  mode: 'multiple',
                  maxTagCount: 2,
                  placeholder: 'load country',
                  options: info.list.map((item) => {
                    return {
                      label: item,
                      value: item,
                    };
                  }),
                  onChange: function (e) {
                    console.log(e);
                    const { updateSchema } = formActionType;
                    getVesselOptionsDataList(
                      {
                        key: 'load_country',
                        values: JSON.stringify(e),
                      },
                      'load_port',
                    ).then((info: any) => {
                      updateSchema({
                        field: 'load_port',
                        componentProps: {
                          options: info.list.map((item) => {
                            return {
                              label: item,
                              value: item,
                            };
                          }),
                        },
                      });
                    });
                  },
                },
              });
            });
          }
        },
      };
    },
  },
  {
    field: 'load_country',
    component: 'ApiSelect',
    label: 'Country',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: ({ formActionType }) => {
      return {
        mode: 'multiple',
        maxTagCount: 2,
        placeholder: 'load country',
        api: async function () {
          const info: any = await getVesselOptionsDataList(
            {
              key: '',
              values: '[]',
            },
            'load_country',
          );
          return info.list.map((item) => {
            return {
              label: item,
              value: item,
            };
          });
        },
        onChange: function (e) {
          console.log(e);
          const { updateSchema } = formActionType;
          const requestList = ['load_port'];
          for (let i = 0; i < requestList.length; i++) {
            getVesselOptionsDataList(
              {
                key: 'load_country',
                values: JSON.stringify(e),
              },
              requestList[i],
            ).then((info: any) => {
              updateSchema({
                field: requestList[i],
                componentProps: {
                  options: info.list.map((item) => {
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
    field: 'load_port',
    component: 'ApiSelect',
    label: 'Port',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: {
      mode: 'multiple',
      maxTagCount: 1,
      placeholder: 'load port',
      api: async function () {
        const info: any = await getVesselOptionsDataList(
          {
            key: '',
            values: '[]',
          },
          'load_port',
        );
        return info.list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'load_zone',
    component: 'ApiSelect',
    label: 'Zone',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: {
      mode: 'multiple',
      maxTagCount: 1,
      placeholder: 'load zone',
      api: async function () {
        const info: any = await getVesselOptionsDataList(
          {
            key: '',
            values: '[]',
          },
          'load_zone',
        );
        return info.list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'discharge_region',
    component: 'ApiSelect',
    label: 'Region',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: ({ formActionType }) => {
      return {
        mode: 'multiple',
        maxTagCount: 2,
        placeholder: 'discharge region',
        api: async function () {
          const info: any = await getVesselOptionsDataList(
            {
              key: '',
              values: '[]',
            },
            'discharge_region',
          );
          return info.list.map((item) => {
            return {
              label: item,
              value: item,
            };
          });
        },
        onChange: function (e) {
          console.log(e);
          const { updateSchema } = formActionType;
          const requestList = ['discharge_country'];
          for (let i = 0; i < requestList.length; i++) {
            getVesselOptionsDataList(
              {
                key: 'discharge_region',
                values: JSON.stringify(e),
              },
              requestList[i],
            ).then((info: any) => {
              updateSchema({
                field: requestList[i],
                componentProps: {
                  mode: 'multiple',
                  maxTagCount: 2,
                  placeholder: 'discharge country',
                  options: info.list.map((item) => {
                    return {
                      label: item,
                      value: item,
                    };
                  }),
                  onChange: function (e) {
                    console.log(e);
                    const { updateSchema } = formActionType;
                    getVesselOptionsDataList(
                      {
                        key: 'discharge_country',
                        values: JSON.stringify(e),
                      },
                      'discharge_port',
                    ).then((info: any) => {
                      updateSchema({
                        field: 'discharge_port',
                        componentProps: {
                          options: info.list.map((item) => {
                            return {
                              label: item,
                              value: item,
                            };
                          }),
                        },
                      });
                    });
                  },
                },
              });
            });
          }
        },
      };
    },
  },
  {
    field: 'discharge_country',
    component: 'ApiSelect',
    label: 'Country',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: ({ formActionType }) => {
      return {
        mode: 'multiple',
        maxTagCount: 2,
        placeholder: 'discharge country',
        api: async function () {
          const info: any = await getVesselOptionsDataList(
            {
              key: '',
              values: '[]',
            },
            'discharge_country',
          );
          return info.list.map((item) => {
            return {
              label: item,
              value: item,
            };
          });
        },
        onChange: function (e) {
          console.log(e);
          const { updateSchema } = formActionType;
          const requestList = ['discharge_port'];
          for (let i = 0; i < requestList.length; i++) {
            getVesselOptionsDataList(
              {
                key: 'discharge_country',
                values: JSON.stringify(e),
              },
              requestList[i],
            ).then((info: any) => {
              updateSchema({
                field: requestList[i],
                componentProps: {
                  options: info.list.map((item) => {
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
    field: 'discharge_port',
    component: 'ApiSelect',
    label: 'Port',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: {
      mode: 'multiple',
      maxTagCount: 1,
      placeholder: 'discharge port',
      api: async function () {
        const info: any = await getVesselOptionsDataList(
          {
            key: '',
            values: '[]',
          },
          'discharge_port',
        );
        return info.list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'discharge_zone',
    component: 'ApiSelect',
    label: 'Zone',
    colProps: {
      span: 6,
    },
    defaultValue: [],
    itemProps: { validateTrigger: 'blur' },
    componentProps: {
      mode: 'multiple',
      maxTagCount: 1,
      placeholder: 'discharge zone',
      api: async function () {
        const info: any = await getVesselOptionsDataList(
          {
            key: '',
            values: '[]',
          },
          'discharge_zone',
        );
        return info.list.map((item) => {
          return {
            label: item,
            value: item,
          };
        });
      },
    },
  },
  {
    field: 'group_load',
    component: 'Select',
    label: 'Load',
    colProps: {
      span: 6,
    },
    componentProps: {
      placeholder: 'group by load',
      options: [
        {
          label: 'Region',
          value: 'load_region',
          key: '1',
        },
        {
          label: 'Country',
          value: 'load_country',
          key: '2',
        },
        {
          label: 'Port',
          value: 'load_port',
          key: '3',
        },
        {
          label: 'Zone',
          value: 'load_zone',
          key: '4',
        },
      ],
    },
  },
  {
    field: 'group_discharge',
    component: 'Select',
    label: 'Discharge',
    colProps: {
      span: 6,
    },
    componentProps: {
      placeholder: 'group by discharge',
      options: [
        {
          label: 'Region',
          value: 'discharge_region',
          key: '1',
        },
        {
          label: 'Country',
          value: 'discharge_country',
          key: '2',
        },
        {
          label: 'Port',
          value: 'discharge_port',
          key: '3',
        },
        {
          label: 'Zone',
          value: 'discharge_zone',
          key: '4',
        },
      ],
    },
  },
  {
    field: 'group_date_type',
    component: 'Select',
    label: 'Date',
    colProps: {
      span: 6,
    },
    defaultValue: 'arrival_date',
    componentProps: {
      options: [
        {
          label: 'Arrival date',
          value: 'arrival_date',
          key: '1',
        },
        {
          label: 'Departure date',
          value: 'departure_date',
          key: '2',
        },
        {
          label: 'Load date from',
          value: 'load_date_from',
          key: '3',
        },
      ],
      allowClear: false,
    },
  },
  {
    field: 'group_frequency',
    component: 'Select',
    label: 'Period',
    colProps: {
      span: 6,
    },
    defaultValue: 'month',
    componentProps: {
      options: [
        {
          label: 'Week',
          value: 'week',
          key: '1',
        },
        {
          label: 'Month',
          value: 'month',
          key: '2',
        },
        {
          label: 'Year',
          value: 'year',
          key: '3',
        },
        {
          label: 'Year%',
          value: 'year%',
          key: '4',
        },
      ],
      allowClear: false,
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
    field: 'query_type',
    component: 'RadioGroup',
    label: '统计类型',
    colProps: {
      span: 6,
    },
    defaultValue: 'basic',
    componentProps: {
      options: [
        {
          label: '周期',
          value: 'basic',
        },
        {
          label: '累计',
          value: 'acc',
        },
        {
          label: '累计同比',
          value: 'acc_ratio',
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
