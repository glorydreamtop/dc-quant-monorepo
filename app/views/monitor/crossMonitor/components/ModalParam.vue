<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModel"
    title="高级设置"
    :canFullscreen="false"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <BasicForm :labelWidth="100" @register="registerForm" :hideRequiredMark="true" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, inject } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  export default defineComponent({
    components: { BasicModal, BasicForm },
    emits: ['on-param-change'],
    setup(_, { emit }) {
      const crossMonitorParam: any = inject('crossMonitorParam')!;
      let schemasSave: FormSchema[] = [
        {
          field: 'mom_lag',
          component: 'InputNumber',
          rules: [
            {
              required: true,
              message: '请填写环比窗口长度',
              type: 'number',
            },
          ],
          label: '环比窗口长度',
          componentProps: {
            style: {
              width: '90%',
            },
          },
          required: true,
        },
        {
          field: 'yoy_lag',
          component: 'InputNumber',
          rules: [
            {
              required: true,
              message: '请填写同比年份长度',
              type: 'number',
            },
          ],
          label: '同比年份长度',
          componentProps: {
            style: {
              width: '90%',
            },
          },
          required: true,
        },
        {
          field: 'yoy_window',
          component: 'InputNumber',
          rules: [
            {
              required: true,
              message: '请填写同比窗口长度',
              type: 'number',
            },
          ],
          label: '同比窗口长度',
          componentProps: {
            style: {
              width: '90%',
            },
          },
          required: true,
        },
        {
          field: 'seasonal_lag',
          component: 'InputNumber',
          rules: [
            {
              required: true,
              message: '请填写季节性年份长度',
              type: 'number',
            },
          ],
          label: '季节性长度',
          componentProps: {
            style: {
              width: '90%',
            },
          },
          required: true,
        },
        {
          field: 'dt_type',
          component: 'RadioGroup',
          label: '日期类型',
          required: true,
          componentProps: {
            options: [
              {
                label: '公历',
                value: 'solar',
              },
              {
                label: '农历',
                value: 'lunar',
              },
            ],
          },
        },
      ];
      const [registerForm, { getFieldsValue, validateFields, setFieldsValue }] = useForm({
        labelCol: {
          span: 7,
        },
        wrapperCol: {
          span: 14,
        },
        schemas: schemasSave,
        showResetButton: false,
        showSubmitButton: false,
      });
      // 弹框配置
      const [registerModel, { closeModal }] = useModalInner((timeStr) => {
        console.log(timeStr);
        setFieldsValue(crossMonitorParam);
      });
      async function handleSubmit() {
        try {
          await validateFields();
          const values = getFieldsValue();
          for (let key in values) {
            crossMonitorParam[key] = values[key];
          }
          emit('on-param-change');
          closeModal();
        } catch (error) {}
      }
      async function handleClose() {
        closeModal();
      }
      return {
        registerModel,
        handleSubmit,
        handleClose,
        registerForm,
      };
    },
  });
</script>
