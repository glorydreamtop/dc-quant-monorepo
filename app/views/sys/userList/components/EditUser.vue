<template>
  <BasicModal @register="registerModal">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { useForm, BasicForm } from '/@/components/Form';
  import { useModalInner, BasicModal } from '/@/components/Modal';
  import { getSchemas } from './schema';
  import { onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const [registerModal, { setModalProps }] = useModalInner();
  const [registerForm] = useForm({
    schemas: getSchemas(),
    showActionButtonGroup: false,
    labelAlign: 'left',
    layout: 'horizontal',
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  });
  onMounted(() => {
    setModalProps({
      width: 400,
      title: t('sys.user.editUserModal.createTitle'),
    });
  });
</script>

<style lang="less" scoped></style>
