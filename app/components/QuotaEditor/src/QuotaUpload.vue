<template>
  <BasicModal v-bind="modalProps" @register="registerModal">
    <div class="flex flex-col items-center min-w-100">
      <div class="border-dashed border-2 w-4/5 px-4 py-6 flex justify-between">
        <div
          class="flex flex-col items-center w-10em cursor-pointer"
          v-for="item in fileList"
          :key="item.name"
        >
          <Icon class="!text-4xl !text-primary" :icon="item.icon" />
          <span class="whitespace-nowrap">{{ item.name }}</span>
        </div>
      </div>
      <Upload class="mt-6 relative h-100px">
        <div class="container">
          <div class="wave"></div>
          <span class="text">暂不可用</span>
        </div>
      </Upload>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import type { ModalProps } from 'ant-design-vue';
  import { Upload } from 'ant-design-vue';
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import Icon from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const [registerModal] = useModalInner(() => {});

  const modalProps: Partial<ModalProps> = reactive({
    title: t('quota.quotaUpload.importQuota'),
    width: '40rem',
    showOkBtn: false,
    showCancelBtn: false,
    canFullscreen: false,
  });
  const fileList = ref([
    {
      icon: 'ant-design:file-excel-filled',
      name: t('quota.quotaUpload.quotaExcel'),
      link: 'http://imgs.shducheng.net/cms/downloadFile?fileKey=files/指标导入模板.xlsx',
    },
    {
      icon: 'ant-design:file-excel-outlined',
      name: t('quota.quotaUpload.quotaDataExcel1'),
      link: 'https://img.shducheng.net/cms/downloadFile?fileKey=files/数据导入模板.xlsx',
    },
    {
      icon: 'ant-design:file-excel-outlined',
      name: t('quota.quotaUpload.quotaDataExcel2'),
      link: 'https://img.shducheng.net/cms/downloadFile?fileKey=files/万得数据导入模板.xlsx',
    },
    {
      icon: 'ant-design:file-excel-outlined',
      name: t('quota.quotaUpload.quotaDataExcel3'),
      link: 'https://img.shducheng.net/cms/downloadFile?fileKey=files/钢联数据导入模板.xlsx',
    },
  ]);
</script>

<style lang="less" scoped>
  .container {
    position: absolute;
    width: 100px;
    height: 100px;
    padding: 2px;
    border: 2px solid #695ff1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    overflow: hidden;
  }

  .wave {
    position: relative;
    width: 90px;
    height: 90px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: @bg-linear-primary;
    border-radius: 50%;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      top: -50%;
      left: 50%;
      background-color: rgb(255 255 255 / 40%);
      border-radius: 35%;
      transform: translate(-50%, -70%) rotate(0);
      animation: rotate 5s linear infinite;
      z-index: 1;
    }

    &::after {
      border-radius: 42%;
      background-color: rgb(255 255 255 / 90%);
      transform: translate(-50%, -70%) rotate(0);
      animation: rotate 4s linear infinite;
      z-index: 2;
    }
  }

  .text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    white-space: nowrap;
    z-index: 10;
  }

  @keyframes rotate {
    50% {
      transform: translate(-50%, -73%) rotate(180deg);
    }

    100% {
      transform: translate(-50%, -70%) rotate(360deg);
    }
  }
</style>
