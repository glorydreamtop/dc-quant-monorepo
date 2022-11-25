<template>
  <div class="flex items-center gap-2">
    <Popover trigger="click">
      <template #content>
        <div class="flex gap-1">
          <Input size="small" v-model:value="colValue.title" />
          <Button size="small" type="primary" @click="addCol(tableConfig.columns.length)">{{
            t('common.okText')
          }}</Button>
        </div>
      </template>
      <Button size="small">{{ t('table.addCol') }}</Button>
    </Popover>
    <Button size="small" @click="addSpaceRow(tableConfig.data.length)">{{
      t('table.addRow')
    }}</Button>
    <DatePicker
      size="small"
      class="!w-auto"
      v-model:value="tableConfig.timeConfig.endDate"
      valueFormat="YYYY-MM-DD"
    >
      <Button class="flex items-center gap-1" size="small">
        <span>{{ t('table.endDate') }}：</span>
        <span class="flex items-center gap-1 cursor-pointer">
          <span>{{ tableConfig.timeConfig.endDate }}</span>
          <Icon class="!text-primary" icon="ant-design:field-time-outlined" />
        </span>
      </Button>
    </DatePicker>
    <Button size="small" type="primary" @click="saveTable">{{ t('common.saveText') }}</Button>
    <Popover trigger="click">
      <template #content>
        <div class="flex flex-col items-center">
          <div class="flex gap-2">
            <div
              v-for="item in tableConfigSchemaList"
              :key="item.preview"
              :class="[
                'flex flex-col items-center gap-2 border',
                defaultTableConfig.name === item.name ? ' border-primary' : '',
              ]"
              @click="defaultTableConfig = item"
            >
              <img class="h-40 w-70" :src="item.preview" alt="" />
              <span class="text-gray-400">{{ item.name }}</span>
            </div>
          </div>
          <Button size="small" class="mt-4 w-60" type="primary" @click="applyConfig">{{
            t('common.apply')
          }}</Button>
        </div>
      </template>
      <Button type="link" size="small">{{ t('table.template') }}</Button>
    </Popover>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, toRaw } from 'vue';
  import { Button, Popover, Input, DatePicker } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableConfigType } from '/#/table';
  import {
    useAddCol,
    useAddRow,
    useTableConfigContext,
    useXGridContext,
    useGridOptionsContext,
  } from './helper';
  import { cloneDeep, mergeWith } from 'lodash-es';
  import { TableConfigSchema, tableConfigSchemaList } from './tableSchema';
  import { VxeGridEventProps, VxeGridProps } from 'vxe-table';
  const { t } = useI18n();

  const tableConfig = useTableConfigContext();
  const xGrid = useXGridContext();
  const gridOptions = useGridOptionsContext();

  const [colValue, { addCol }] = useAddCol(xGrid, tableConfig);
  const { addSpaceRow } = useAddRow(xGrid, tableConfig);
  // const popoverVisible = reactive({

  // })
  function saveTable() {
    const $table = xGrid.value;
    const mergeCells = $table.getMergeCells();
    tableConfig.mergeCells = cloneDeep(toRaw(mergeCells));
    console.log(tableConfig);
  }
  const defaultTableConfig = ref<TableConfigSchema>({});
  // 模板转换成vxe-table的props
  function transfer(table: TableConfigType) {
    const gridOptions: VxeGridProps & VxeGridEventProps = {
      columns: [],
      data: [],
    };
    for (let i = 0; i < table.columns.length; i++) {
      const col = table.columns[i];
      const column = {
        field: col.field,
        title: col.title,
        editRender: {
          name: 'input',
        },
        slots: {
          header: 'normal-title-text',
          default: 'normal-cell-text',
          edit: 'normal-cell-text-editor',
        },
      };
      gridOptions.columns?.push(column);
    }
    for (let i = 0; i < table.data.length; i++) {
      const data = {};
      const origin = table.data[i];
      Object.keys(origin).forEach((key) => {
        data[key] = origin[key].val;
      });
      gridOptions.data?.push(data);
    }
    return gridOptions;
  }
  // 应用模板
  async function applyConfig() {
    gridOptions.columns = [];
    gridOptions.data = [];
    tableConfig.columns = [];
    tableConfig.data = [];
    mergeWith(gridOptions, cloneDeep(transfer(defaultTableConfig.value)), (target, src) => {
      if (target instanceof Array) {
        return reactive(src);
      }
    });
    mergeWith(tableConfig, cloneDeep(defaultTableConfig.value), (target, src) => {
      if (target instanceof Array) {
        return reactive(src);
      }
    });
  }
</script>

<style lang="less" scoped></style>
