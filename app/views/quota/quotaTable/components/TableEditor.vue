<template>
  <div class="p-4 bg-white table-container w-fit">
    <ToolBar class="toolbar" />
    <VxeGrid v-bind="gridOptions" ref="xGrid" class="main-table">
      <template #cell-text="{ row, column }">
        <div class="select-none">
          {{ row[column.property] }}
        </div>
      </template>
      <template #cell-text-editor="{ row, column }">
        <Input class="text-center" v-model:value="row[column.property]" />
      </template>
    </VxeGrid>
    <div class="flex items-center col-name">
      <div v-for="col in gridOptions.columns" :key="col.field" class="flex-grow">{{
        col.field
      }}</div>
    </div>
    <div class="flex flex-col items-center row-index">
      <div v-for="idx in tableConfig.data?.length" :key="idx" class="flex-grow">{{ idx }}</div>
    </div>
    <div class="corner"></div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, nextTick } from 'vue';
  import type {
    VxeGridProps,
    VxeGridInstance,
    VxeGridEventProps,
    VxeTableDefines,
    VxeGridDefines,
  } from 'vxe-table';
  import { BasicHelp } from '/@/components/Basic';
  import { Popover, Input } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    createTableConfigContext,
    createXGridContext,
    createGridOptionsContext,
    useAddCol,
    useAddRow,
    useAreaSelect,
  } from './helper';
  import type { TableConfigType } from '/#/table';
  import { maxBy, minBy, remove } from 'lodash-es';
  import { useModal } from '/@/components/Modal';
  import ToolBar from './ToolBar.vue';
  import { Icon } from '@dq-next/icon';
  import { getSingleQuotaData } from '@dq-next/http-apis/quota';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formatToDate } from '@dq-next/utils/dateUtil';

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const xGrid = ref({} as VxeGridInstance);
  createXGridContext(xGrid);
  const gridOptions = reactive<VxeGridProps & VxeGridEventProps>({
    border: true,
    align: 'center',
    columnConfig: {
      width: 100,
      minWidth: 80,
    },
    columns: [],
    showHeader: false,
    editConfig: {
      trigger: 'dblclick',
      mode: 'cell',
      showIcon: false,
    },
    data: [],
    mergeCells: [],
    cellClassName: ({ rowIndex, columnIndex }) => {
      if (selectedCells.value.find((cell) => cell.row === rowIndex && cell.col === columnIndex)) {
        return 'area-cells';
      }
      return '';
    },
    menuConfig: {
      body: {
        options: [
          [
            {
              code: 'mergeCells',
              name: t('table.contextmenu.mergeCells'),
              disabled: false,
            },
            {
              code: 'splitCells',
              name: t('table.contextmenu.splitCells'),
              disabled: false,
            },
            {
              code: 'insertRowBefore',
              name: t('table.contextmenu.insertRowBefore'),
              disabled: false,
            },
            {
              code: 'insertRowAfter',
              name: t('table.contextmenu.insertRowAfter'),
              disabled: false,
            },
            {
              code: 'insertColLeft',
              name: t('table.contextmenu.insertColLeft'),
              disabled: false,
            },
            {
              code: 'insertColRight',
              name: t('table.contextmenu.insertColRight'),
              disabled: false,
            },
            {
              code: 'removeCol',
              name: t('table.contextmenu.removeCol'),
              disabled: false,
            },
            {
              code: 'removeRow',
              name: t('table.contextmenu.removeRow'),
              disabled: false,
            },
          ],
        ],
      },
    },
    onCellMenu: ({ rowIndex, column }) => {
      const menuList = gridOptions.menuConfig!.body!.options![0];
      const updateCellDataMenu = {
        code: 'updateCellData',
        name: t('table.contextmenu.updateCellData'),
        disabled: false,
      };
      // 如果是指标数据单元格，添加“刷新数据”的右键菜单
      if (menuList.find((menu) => menu.code === updateCellDataMenu.code)) {
        // remove(menuList, (menu) => menu.code === updateCellDataMenu.code);
        // if (tableConfig.data[rowIndex!][column.property].type === CellTypeEnum.quota) {
        //   menuList.push(updateCellDataMenu);
        // }
      }
    },
    onMenuClick: ({ menu, rowIndex, columnIndex, column, row }) => {
      const $table = xGrid.value;
      switch (menu.code) {
        case 'mergeCells':
          const cells = getAreaCells().value;
          const minRow = minBy(cells, (cell) => cell.row)!.row;
          const maxRow = maxBy(cells, (cell) => cell.row)!.row;
          const minCol = minBy(cells, (cell) => cell.col)!.col;
          const maxCol = maxBy(cells, (cell) => cell.col)!.col;
          const info = {
            row: minBy(cells, (cell) => cell.row)!.row,
            col: minBy(cells, (cell) => cell.col)!.col,
            rowspan: maxRow - minRow + 1,
            colspan: maxCol - minCol + 1,
          };
          $table.setMergeCells([info]);
          const oldMerge = gridOptions.mergeCells?.find((cellInfo) => {
            cellInfo.col === info.col;
            cellInfo.row === info.row;
          });
          if (oldMerge) {
            oldMerge.colspan = info.colspan;
            oldMerge.rowspan = info.rowspan;
          } else {
            gridOptions.mergeCells?.push(info);
          }
          break;
        case 'splitCells':
          $table.removeMergeCells({
            row: rowIndex,
            col: columnIndex,
          } as VxeTableDefines.MergeOptions);
          break;
        case 'updateCellData':
          // getSingleData({ rowIndex, columnIndex, column, row });
          break;
        case 'insertRowBefore':
          addSpaceRow(rowIndex);
          break;
        case 'insertRowAfter':
          const mergedRow = $table
            .getMergeCells()
            .find((cell) => cell.row === rowIndex && cell.rowspan > 1);
          const rowNum = mergedRow ? rowIndex + mergedRow.rowspan : rowIndex + 1;
          addSpaceRow(rowNum);
          break;
        case 'insertColLeft':
          addCol(columnIndex);
          break;
        case 'insertColRight':
          const mergedCol = $table
            .getMergeCells()
            .find((cell) => cell.row === columnIndex && cell.colspan > 1);
          const colNum = mergedCol ? columnIndex + mergedCol.colspan : columnIndex + 1;
          addCol(colNum);
          break;
        case 'removeCol':
          removeCol(columnIndex);
          break;
        case 'removeRow':
          removeRow(rowIndex);
          break;
      }
    },
    onEditActived: () => {
      (
        document.getElementsByClassName('area-select-border')[0] as HTMLElement
      ).style.backgroundColor = 'transparent';
    },
    onEditClosed: (params) => {
      (
        document.getElementsByClassName('area-select-border')[0] as HTMLElement
      ).style.backgroundColor = 'rgb(64 158 255 / 30%)';
      updateCellData(params);
    },
  });
  createGridOptionsContext(gridOptions);
  const tableConfig: TableConfigType = reactive({
    title: '',
    columns: [],
    mergeCells: [],
    data: [],
  });
  createTableConfigContext(tableConfig);
  const [, { addCol, removeCol }] = useAddCol(xGrid, tableConfig);
  const { addSpaceRow, removeRow } = useAddRow(xGrid, tableConfig);
  const { getAreaCells } = useAreaSelect(xGrid, (cells) => {
    selectedCells.value = cells;
  });
  const selectedCells = ref<any[]>([]);
  // 更新单元格内容
  function updateCellData({
    column,
    rowIndex,
    row,
  }: Partial<VxeGridDefines.EditClosedEventParams>) {
    const key = column!.getKey();
    tableConfig.data[rowIndex!][key] = row[key];
    // getSingleData({ column, rowIndex, row, columnIndex });
  }
  //

  // 请求单个指标数据
  // async function getSingleData({
  //   row,
  //   column,
  //   rowIndex,
  //   columnIndex,
  // }: Partial<VxeGridDefines.EditClosedEventParams>) {
  //   const cell = tableConfig.data[rowIndex!][column!.property];
  //   if (cell.type === CellTypeEnum.formula) {
  //     // 四则运算公式解析
  //     const str: string = row[column!.property];
  //     const exp = str.replace(/([a-z])(\d+)/g, function (m) {
  //       const [field, rowIdx] = m.match(/([a-z]+)|(\d+)/g);
  //       const cell = tableConfig.data[rowIdx - 1][field];
  //       return cell.type === 0 ? cell.val : cell.qData;
  //     });
  //     cell.qData = eval(exp);
  //   } else if (cell.type === CellTypeEnum.quota) {
  //     if (tableConfig.columns[columnIndex!].headerType !== HeaderCellTypeEnum.date) {
  //       createMessage.warn(t('table.headerCell.isNotDateTip'));
  //       return;
  //     }
  //     const id = parseInt(row[column!.property]);
  //     if (isNaN(id) || id.toString() !== row[column!.property]) {
  //       createMessage.warn(t('table.cell.idError'));
  //       return;
  //     }
  //     const data = await getSingleQuotaData({
  //       id,
  //       date: timeStrFilter(tableConfig.columns[columnIndex!].timeStr!),
  //     });
  //     cell.qData = (data[0]?.data[0] ?? [0, t('common.noData')])[1].toString();
  //   }
  // }
</script>

<style lang="less" scoped>
  ::v-deep(.area-cells) {
    // background-color: rgb(64 158 255 / 30%);
  }

  @border-color: lighten(@primary-color, 20%);

  ::v-deep(.vxe-table--render-default.border--full .vxe-body--column) {
    background-image: linear-gradient(@border-color, @border-color),
      linear-gradient(@border-color, @border-color);
  }

  ::v-deep(.vxe-table--render-default .vxe-table--border-line) {
    border-color: @border-color;
  }

  .table-container {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: repeat(3, auto);
    gap: 4px;

    .toolbar {
      grid-row: 1/2;
      grid-column: 1/3;
    }

    .col-name,
    .row-index {
      > div {
        border: 1px solid @border-color;
        text-align: center;
        font-size: 14px;
      }
    }

    .col-name {
      grid-row: 2/3;
      grid-column: 2/3;

      > div {
        border-right-width: 0;

        &:last-child {
          border-right-width: 1px;
        }
      }
    }

    .main-table {
      grid-row: 3/4;
      grid-column: 2/3;
    }

    .row-index {
      grid-row: 3/4;
      grid-column: 1/2;

      > div {
        width: 2em;
        border-bottom-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        &:last-child {
          border-bottom-width: 1px;
        }
      }
    }

    .corner {
      grid-row: 2/3;
      grid-column: 1/2;
      width: 2em;
      border: 1px solid @border-color;
    }
  }
</style>
