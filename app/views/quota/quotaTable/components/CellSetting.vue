<template>
  <BasicModal @register="registerModal" v-bind="modalConfig">
    <div class="flex flex-col items-center">
      <div>
        <span class="mr-2">{{ t('table.cell.type') }}</span>
        <Select v-model:value="tableConfig.data[info.rowIndex][info.column.property].type">
          <SelectOption :key="0">{{ t('table.cell.normal') }}</SelectOption>
          <SelectOption :key="1">{{ t('table.cell.quota') }}</SelectOption>
          <SelectOption :key="2">{{ t('table.cell.formula') }}</SelectOption>
        </Select>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import { ModalProps, Select } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useTableConfigContext } from './helper';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { VxeGridDefines } from 'vxe-table';

  const SelectOption = Select.Option;
  const { t } = useI18n();
  const tableConfig = useTableConfigContext();
  const info: Partial<VxeGridDefines.CellClickEventParams> = reactive({
    column: { property: 'a' },
    rowIndex: 0,
  });
  const [registerModal] = useModalInner(
    ({ column, rowIndex }: VxeGridDefines.CellClickEventParams) => {
      console.log({ column, rowIndex });

      Object.assign(info, { column, rowIndex });
    },
  );
  const modalConfig: Partial<ModalProps> = reactive({
    title: t('table.cell.modalTitle'),
    showOkBtn: false,
    showCancelBtn: false,
    width: 300,
  });
</script>

<style lang="less" scoped></style>
