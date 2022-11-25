import { cloneDeep, remove } from 'lodash-es';
import { CSSProperties, reactive, ref, toRaw } from 'vue';
import { VxeGridEventProps, VxeGridInstance, VxeGridProps, VxeTableDefines } from 'vxe-table';
import { TableConfigType } from '/#/table';
import { onMountedOrActivated } from '/@/hooks/core/onMountedOrActivated';

import type { InjectionKey, Ref } from 'vue';
import { createContext, useContext } from '/@/hooks/core/useContext';
import { daysAgo } from '@dq-next/utils/dateUtil';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
const tableConfigKey: InjectionKey<TableConfigType> = Symbol();
const XGridKey: InjectionKey<VxeGridInstance> = Symbol();
const gridOptionsKey: InjectionKey<VxeGridProps & VxeGridEventProps> = Symbol();

export function createTableConfigContext(context: TableConfigType) {
  return createContext<TableConfigType>(context, tableConfigKey, { native: true });
}

export function useTableConfigContext() {
  return useContext<TableConfigType>(tableConfigKey);
}

export function createXGridContext(context: Ref<VxeGridInstance>) {
  return createContext<Ref<VxeGridInstance>>(context, XGridKey, { native: true });
}

export function useXGridContext() {
  return useContext<Ref<VxeGridInstance>>(XGridKey);
}

export function createGridOptionsContext(context: VxeGridProps & VxeGridEventProps) {
  return createContext<VxeGridProps & VxeGridEventProps>(context, gridOptionsKey, { native: true });
}

export function useGridOptionsContext() {
  return useContext<VxeGridProps & VxeGridEventProps>(gridOptionsKey);
}

type useAddColMethods = [
  VxeTableDefines.ColumnOptions,
  { addCol: (columnIndex: number) => void; removeCol: (columnIndex: number) => void },
];

interface HookState {
  col: VxeTableDefines.ColumnOptions;
}

const hookState: HookState = reactive({
  col: {
    field: '',
    title: '新列',
    editRender: {
      name: 'input',
    },
    slots: {
      header: 'normal-title-text',
      default: 'normal-cell-text',
      edit: 'normal-cell-text-editor',
    },
  },
});

export function useAddCol(
  xGrid: Ref<VxeGridInstance>,
  tableConfig: TableConfigType,
): useAddColMethods {
  const usedStr = ['a', 'b', 'c', 'd', 'e'];
  const { getUniqueField } = useUniqueField(usedStr);
  function addCol(columnIndex = tableConfig.columns.length) {
    hookState.col.field = getUniqueField();
    // 插入新列给tableConfig
    tableConfig.columns.splice(columnIndex, 0, {
      title: hookState.col.title,
      field: hookState.col.field,
      headerType: 0,
    });
    // 生成table所需列信息
    const colInfoArr = tableConfig.columns.map((_col) => {
      const colCfg = cloneDeep(toRaw(hookState.col));
      colCfg.title = _col.title;
      colCfg.field = _col.field;
      return colCfg;
    });
    // 给tableConfig每一行数据加上这个新列字段
    tableConfig.data.forEach((data) => {
      data[hookState.col.field!] = {
        val: '-',
        qData: '',
        type: 0,
      };
    });
    const $grid = xGrid.value;
    $grid.loadColumn(colInfoArr);
    hookState.col.field = '';
    hookState.col.title = '新列';
  }
  function removeCol(columnIndex: number) {
    const $grid = xGrid.value;
    const { fullData } = $grid.getTableData();
    // console.log({ fullData, tableData, d: tableConfig.data });
    const field = tableConfig.columns[columnIndex].field!;
    // 移除数据中的该列字段
    fullData.forEach((item) => {
      Reflect.deleteProperty(item, field);
    });
    tableConfig.data.forEach((data) => {
      Reflect.deleteProperty(data, field);
    });
    $grid.loadData(fullData);
    // 移除这个列
    tableConfig.columns.splice(columnIndex, 1);
    const colInfoArr = tableConfig.columns.map((_col) => {
      const colCfg = cloneDeep(toRaw(hookState.col));
      colCfg.title = _col.title;
      colCfg.field = _col.field;
      return colCfg;
    });
    $grid.loadColumn(colInfoArr);
  }
  return [hookState.col, { addCol, removeCol }];
}

type useAddSpaceRowMethods = {
  addSpaceRow: (rowIndex: number) => void;
  removeRow: (rowIndex: number) => void;
};

export function useAddRow(
  xGrid: Ref<VxeGridInstance>,
  tableConfig: TableConfigType,
): useAddSpaceRowMethods {
  function addSpaceRow(rowIndex = tableConfig.data.length) {
    const row = {};
    const dataRow = {};
    // 构建新行数据
    tableConfig.columns.forEach((column) => {
      row[column.field!] = '-';
      dataRow[column.field!] = {
        type: 0,
        val: '-',
      };
    });
    tableConfig.data.splice(rowIndex, 0, dataRow);
    const $grid = xGrid.value;
    const { fullData } = $grid.getTableData();
    // console.log({ fullData, tableData, d: tableConfig.data });
    fullData.splice(rowIndex, 0, row);
    $grid.loadData(fullData);
  }
  function removeRow(rowIndex: number) {
    tableConfig.data.splice(rowIndex, 1);
    const $grid = xGrid.value;
    const { fullData } = $grid.getTableData();
    // console.log({ fullData, tableData, d: tableConfig.data });
    fullData.splice(rowIndex, 1);
    $grid.loadData(fullData);
  }
  return { addSpaceRow, removeRow };
}

type useUniqueFieldMethods = { getUniqueField: () => string };
/**
 * @description:生成唯一字段
 */
export function useUniqueField(_usedStr?: string[]): useUniqueFieldMethods {
  const usedStr: string[] = _usedStr || [];
  // 可用字段
  const fieldStr = 'abcdefghijklmnopqrstuvwxyz';
  function getUniqueField(): string {
    const len = usedStr.length;
    let field = '';
    if (len === 0) {
      field = 'a';
      usedStr.push(field);
    } else {
      // 最后一个已用字段
      const last = usedStr[len - 1];
      const fieldLen = last.length;
      // 最后一个已用字段的最后一个字符在fieldStr中的序号
      const index = fieldStr.indexOf(last[fieldLen - 1]);
      if (index > -1 && index < 25) {
        // field = fieldStr.charAt(index + 1);
        field = last.slice(0, fieldLen - 1) + fieldStr.charAt(index + 1);
      } else {
        field = new Array(fieldLen + 1).fill('a').join('');
      }
    }
    usedStr.push(field);
    return field;
  }
  return { getUniqueField };
}
interface cellPosition {
  col: number;
  row: number;
}
export function useAreaSelect(
  xGrid: Ref<VxeGridInstance>,
  onAreaSelect: (cell: cellPosition[]) => void,
) {
  const areaCells = ref<cellPosition[]>([]);
  onMountedOrActivated(() => {
    const tableDOM = xGrid.value.$el as HTMLElement;
    const tbody = tableDOM.getElementsByTagName('tbody')[0];
    const areaSelectorDOM = document.createElement('div');
    Object.assign(areaSelectorDOM.style, {
      position: 'absolute',
      zIndex: 999,
      backgroundColor: 'rgba(64,158,255,0.4)',
      pointerEvents: 'none',
    } as CSSProperties);
    const showAreaSelector = ref(false);
    const rectInfo = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      toRight: true,
      toBottom: true,
    };
    // 判断元素重叠
    function isOverlap(node: HTMLElement) {
      const rect1 = node.getBoundingClientRect();
      const rect2 = areaSelectorDOM.getBoundingClientRect();
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    }
    // 鼠标按下开始绘制选区
    function mousedownListener(e: MouseEvent) {
      if (
        e.button !== 0 ||
        e.buttons !== 1 ||
        e.ctrlKey ||
        e.shiftKey ||
        (e.target as HTMLElement).nodeName === 'INPUT'
      )
        return;

      remove(areaCells.value, (_) => _);
      rectInfo.startX = e.clientX;
      rectInfo.startY = e.clientY;
      rectInfo.endX = e.clientX;
      rectInfo.endY = e.clientY;
      showAreaSelector.value = true;
      areaSelectorDOM.style.left = `${rectInfo.startX}px`;
      areaSelectorDOM.style.top = `${rectInfo.startY}px`;
      Object.assign(areaSelectorDOM.style, {
        left: `${rectInfo.startX}px`,
        top: `${rectInfo.startY}px`,
        width: `0px`,
        height: `0px`,
      });
      document.body.appendChild(areaSelectorDOM);
      tbody.addEventListener('mousemove', mousemoveListener);
      tbody.addEventListener('mouseup', mouseupListener);
    }
    // 鼠标移动开始缩放选区
    function mousemoveListener(e: MouseEvent) {
      rectInfo.endX = e.clientX;
      rectInfo.endY = e.clientY;

      Object.assign(areaSelectorDOM.style, {
        left: `${Math.min(rectInfo.startX, rectInfo.endX)}px`,
        top: `${Math.min(rectInfo.startY, rectInfo.endY)}px`,
        width: `${Math.abs(rectInfo.endX - rectInfo.startX)}px`,
        height: `${Math.abs(rectInfo.endY - rectInfo.startY)}px`,
      });
    }
    // 鼠标弹起结束选取
    function mouseupListener() {
      tbody.removeEventListener('mousemove', mousemoveListener);
      tbody.removeEventListener('mouseup', mouseupListener);
      showAreaSelector.value = false;
      tbody.querySelectorAll('td').forEach((td) => {
        if (isOverlap(td)) {
          const col = xGrid.value.getColumnNode(td)!.index;
          const row = xGrid.value.getRowNode(td.parentNode!)!.index;
          areaCells.value.push({ col, row });
        }
      });
      document.body.removeChild(areaSelectorDOM);
      onAreaSelect(areaCells.value);
    }
    tbody.addEventListener('mousedown', mousedownListener);
  });
  function getAreaCells() {
    return areaCells;
  }
  function setAreaCells(cells: cellPosition[]) {
    remove(areaCells.value, (_) => _);
    areaCells.value.push(...cells);
  }
  return { getAreaCells, setAreaCells };
}

type useTimeStrFilterMethods = [
  Ref<string>,
  { timeStrFilter: (str: string) => string; vaildTimeStr: (e: InputEvent) => void },
];

export function useTimeStrFilter(tableConfig: TableConfigType): useTimeStrFilterMethods {
  const tip = ref('');
  function timeStrFilter(str: string) {
    if (/^\d{4}-\d{2}-\d{2}$/i.test(str)) {
      return str;
    } else if (/^-?\d+$/i.test(str)) {
      return daysAgo(Math.abs(parseInt(str)), tableConfig.timeConfig.endDate);
    } else {
      return tableConfig.timeConfig.endDate;
    }
  }
  function vaildTimeStr(e: InputEvent) {
    const str = (e.target as HTMLInputElement).value;
    if (/^\d{4}-\d{2}-\d{2}$/i.test(str)) {
      tip.value = t('table.headerCell.isDate');
    } else if (/^-?\d+$/i.test(str)) {
      tip.value = t('table.headerCell.isOffset');
    } else {
      tip.value = t('table.headerCell.isError');
    }
  }
  return [tip, { timeStrFilter, vaildTimeStr }];
}
