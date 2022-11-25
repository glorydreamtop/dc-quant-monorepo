<template>
  <BasicModal
    @register="registerModal"
    @ok="clearData"
    :dialogStyle="{
      left: '-30%',
      top: '40%',
    }"
  >
    <div class="flex flex-col items-center gap-1">
      <span
        ><span class="text-primary">{{ info.quota.name }}</span
        >{{
          `,${t('quota.actions.delQuotaDataInfo.amount')}${info.quota.rowsCount}${t(
            'quota.actions.delQuotaDataInfo.rowsCount',
          )}`
        }}</span
      >
      <span class="">{{ t('quota.actions.delQuotaDataTip') }}</span>
      <div class="picker">
        <DatePicker v-model:value="info.startDate" value-format="YYYY-MM-DD">
          <span>{{ info.startDate }}</span>
        </DatePicker>
        <span>~</span>
        <DatePicker v-model:value="info.endDate" value-format="YYYY-MM-DD">
          <span>{{ info.endDate }}</span>
        </DatePicker>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import { DatePicker } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { formatToDate, yearsAgo } from '@dq-next/utils/dateUtil';
  import { QuotaItem } from '/#/quota';
  import { delQuotaData } from '@dq-next/http-apis/quota';
  import { useMessage } from '/@/hooks/web/useMessage';

  interface infoType {
    startDate: string;
    endDate: string;
    quota: QuotaItem | {};
    loading: boolean;
  }

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const info: infoType = reactive({
    startDate: yearsAgo(1),
    endDate: formatToDate(),
    quota: {},
    loading: false,
  });
  const [registerModal, { setModalProps, closeModal }] = useModalInner((quota: QuotaItem) => {
    setModalProps({
      canFullscreen: false,
      height: 80,
      minHeight: 80,
      width: 300,
      okText: t('quota.actions.clearData'),
      okButtonProps: {
        loading: info.loading,
      },
    });
    info.quota = quota;
  });
  async function clearData() {
    try {
      await delQuotaData({
        indexId: info.quota!.id,
        startDate: info.startDate,
        endDate: info.endDate,
      });
      createMessage.success(t('sys.api.delOK'));
      closeModal();
    } catch (error) {
      createMessage.error(error);
    }
  }
</script>

<style lang="less" scoped>
  .picker {
    transition: border 0.2s;

    @apply w-fit px-1 rounded-sm mx-auto flex items-center justify-center border hover:border-primary;
  }
</style>
