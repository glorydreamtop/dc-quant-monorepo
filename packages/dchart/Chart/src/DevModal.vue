<template>
  <BasicModal @register="register">
    <JsonPreview />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { JsonPreview } from '/@/components/CodeEditor';

  // const data

  const [register, { closeModal, setModalProps }] = useModalInner();
</script>

<style lang="less" scoped></style>
