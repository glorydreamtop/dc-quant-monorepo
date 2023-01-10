<template>
  <BasicModal @register="register">
    <p class="leading-7" v-html="mainContent"></p>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useModalInner, BasicModal } from '/@/components/Modal';

  const mainContent = ref('');

  const [register, { setModalProps }] = useModalInner(
    ({ title, content }: { title: string; content: string }) => {
      mainContent.value = content;
      setModalProps({ title, showOkBtn: false, showCancelBtn: false });
    },
  );
</script>

<style lang="less" scoped></style>
