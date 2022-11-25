<template>
  <BasicModal @register="register" title="谨慎操作" :show-cancel-btn="false" :show-ok-btn="false">
    <div class="flex flex-col items-center gap-4">
      <div class="text-lg px-8 text-center flex flex-col">
        <span class="text-sm text-gray-600">注：清除数据不会删掉这些指标</span>
      </div>
      <div>
        <div class="text-gray-500">
          <span>请选择清除区间：</span>
          <BasicHelp placement="right" text="请手动完成选择，系统不会预设日期" />
        </div>
        <RangePicker v-model:value="timeRange" />
      </div>
      <Button type="danger" size="large" class="mt-4" @click="del"
        >我已确认，清除这些指标的数据</Button
      >
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, Ref, ref, unref } from 'vue';
  import { QuotaItem } from '/#/quota';
  import { BasicHelp } from '/@/components/Basic';
  import { Button, DatePicker } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { delQuotaData } from '@dq-next/http-apis/quota';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { DateUtil } from '@dq-next/utils/dateUtil';

  export default defineComponent({
    components: {
      BasicModal,
      RangePicker: DatePicker.RangePicker,
      Button,
      BasicHelp,
    },
    setup() {
      const record = ref<QuotaItem[]>([]);
      const [register, { closeModal }] = useModalInner((_record: QuotaItem[]) => {
        record.value = _record;
      });
      const timeRange: Ref<DateUtil[]> = ref([]);
      const { createMessage } = useMessage();
      async function del() {
        const [startDate, endDate] = unref(timeRange).map((t) => t.format('YYYY-MM-DD'));
        try {
          await delQuotaData({
            indexList: record.value.map((q) => q.id).join(','),
            startDate,
            endDate,
          });
          timeRange.value = [];
          createMessage.success('清除成功');
          closeModal();
        } catch (error) {}
      }
      return {
        register,
        timeRange,
        del,
      };
    },
  });
</script>
