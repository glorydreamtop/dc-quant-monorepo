<template>
  <BasicModal v-bind="$attrs" @register="registerModel" :canFullscreen="false" :height="270">
    <BasicForm @register="registerForm" />
    <template #footer>
      <Button @click="cancel">取消</Button>
      <Button @click="handleReset" v-if="setStatus">还原</Button>
      <Button type="primary" @click="handleSubmit">确认</Button>
    </template>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Button } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  export default defineComponent({
    components: { Button, BasicModal, BasicForm },
    emits: ['on-chart-set', 'on-config-reset'],
    setup(_, { emit }) {
      let curObj: any = null;
      const setStatus = ref(false);
      const [registerModel, { closeModal }] = useModalInner((obj) => {
        curObj = obj;
        setStatus.value = curObj.obj.setStatus;
        setFieldsValue(setConfig.find((item) => item.index == obj.index));
      });
      const setConfig = [
        {
          index: 0,
          min: null,
          max: null,
          inverse: false,
          showPercent: false,
        },
        {
          index: 1,
          min: null,
          max: null,
          inverse: false,
          showPercent: false,
        },
        {
          index: 2,
          min: null,
          max: null,
          inverse: false,
          showPercent: false,
        },
        {
          index: 3,
          min: null,
          max: null,
          inverse: false,
          showPercent: false,
        },
        {
          index: 4,
          min: null,
          max: null,
          inverse: false,
          showPercent: false,
        },
        {
          index: 5,
          min: null,
          max: null,
          inverse: false,
          showPercent: false,
        },
      ];
      const schemas: FormSchema[] = [
        {
          field: 'index',
          component: 'Select',
          label: '对应Y轴',
          labelWidth: 100,
          colProps: {
            span: 22,
          },
          defaultValue: 0,
          componentProps: ({ formModel }) => {
            return {
              options: [
                {
                  label: '左/1',
                  value: 0,
                },
                {
                  label: '右/1',
                  value: 1,
                },
                {
                  label: '左/2',
                  value: 2,
                },
                {
                  label: '右/2',
                  value: 3,
                },
                {
                  label: '左/3',
                  value: 4,
                },
                {
                  label: '右/3',
                  value: 5,
                },
              ],
              allowClear: false,
              onChange: (index) => {
                const config = setConfig.find((item) => item.index == index);
                Object.assign(formModel, config);
              },
            };
          },
        },
        {
          field: 'min',
          component: 'InputNumber',
          placeholder: '请输入',
          label: '最小值',
          labelWidth: 100,
          colProps: {
            span: 11,
          },
        },
        {
          field: 'max',
          component: 'InputNumber',
          placeholder: '请输入',
          label: '最大值',
          labelWidth: 100,
          colProps: {
            span: 11,
          },
        },
        {
          field: 'inverse',
          component: 'RadioGroup',
          label: '逆序',
          labelWidth: 100,
          colProps: {
            span: 11,
          },
          defaultValue: false,
          componentProps: {
            options: [
              {
                label: '否',
                value: false,
              },
              {
                label: '是',
                value: true,
              },
            ],
          },
        },
        {
          field: 'showPercent',
          component: 'RadioGroup',
          label: '百分比',
          labelWidth: 100,
          colProps: {
            span: 11,
          },
          defaultValue: false,
          componentProps: {
            options: [
              {
                label: '否',
                value: false,
              },
              {
                label: '是',
                value: true,
              },
            ],
          },
        },
      ];
      const [registerForm, { getFieldsValue, setFieldsValue }] = useForm({
        schemas,
        showResetButton: false,
        showSubmitButton: false,
      });
      const handleSubmit = () => {
        let values = getFieldsValue();
        values.min = values.min ?? null;
        values.max = values.max ?? null;
        setConfig.forEach((item) => {
          if (item.index == values.index) {
            Object.assign(item, values);
          }
        });
        emit('on-chart-set', values, curObj);
        closeModal();
      };
      function cancel() {
        closeModal();
      }
      function handleReset() {
        emit('on-config-reset', curObj);
        closeModal();
      }
      return {
        setStatus,
        registerModel,
        registerForm,
        handleSubmit,
        handleReset,
        cancel,
      };
    },
  });
</script>
