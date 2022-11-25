<template>
  <BasicModal v-bind="modalProps" @register="registerModal" @ok="updateQuotaInfo" @cancel="cancel">
    <BasicForm v-loading="loading" @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import type { ModalProps } from 'ant-design-vue';
  import { ref, reactive } from 'vue';
  import { useForm, BasicForm } from '/@/components/Form';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { schemas } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { QuotaItem } from '/#/quota';
  import { saveQuota } from '@dq-next/http-apis/quota';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const quotaId = ref<number>(0);
  const loading = ref(false);
  const [registerModal, { closeModal }] = useModalInner((quotaInfo: QuotaItem) => {
    quotaId.value = quotaInfo.id;
    setFieldsValue(quotaInfo);
  });

  const [registerForm, { setFieldsValue, validateFields, getFieldsValue, resetFields }] = useForm({
    schemas: schemas,
    showResetButton: false,
    showSubmitButton: false,
    // layout: 'horizontal',
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
  });

  const modalProps: Partial<ModalProps> = reactive({
    title: t('quota.quotaEditorModal.title'),
    okText: t('common.saveText'),
  });
  async function updateQuotaInfo() {
    try {
      await validateFields();
      const form = getFieldsValue() as QuotaItem;
      if (quotaId.value !== 0) {
        form.id = quotaId.value;
      }
      loading.value = true;
      await saveQuota(form);
      cancel();
    } catch (error) {
      createMessage.error(error);
    } finally {
      loading.value = false;
    }
  }
  async function cancel() {
    await resetFields();
    quotaId.value = 0;
    closeModal();
  }
</script>

<style lang="less" scoped></style>
