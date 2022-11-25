<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModel"
    title="保存至专项列表"
    :canFullscreen="false"
    :minHeight="50"
    @ok="handleSubmit"
    @cancel="handleClose"
    okText="保存"
    cancelText="取消"
  >
    <BasicForm :labelWidth="80" @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  export default defineComponent({
    components: { BasicModal, BasicForm },
    emits: ['on-jodi-submit'],
    setup(_, { emit }) {
      let schemasSave: FormSchema[] = [
        {
          field: 'name',
          component: 'Input',
          label: '名称',
          required: true,
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
      const [registerModel, { closeModal }] = useModalInner((editInfo) => {
        if (editInfo) {
          setFieldsValue({ name: editInfo.specialName });
        }
      });
      async function handleSubmit() {
        try {
          await validateFields();
          let values = getFieldsValue();
          emit('on-jodi-submit', values);
          closeModal();
        } catch (error) {}
      }
      async function handleClose() {
        closeModal();
      }
      return {
        registerModel,
        closeModal,
        handleSubmit,
        handleClose,
        registerForm,
      };
    },
  });
</script>
