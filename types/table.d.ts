import { VxeTableDefines, VxeTablePropTypes } from 'vxe-table';

type TableCol = VxeTableDefines.ColumnOptions;

interface RowData {
  [key: string]: string;
}

export interface TableConfigType {
  title: string;
  columns: TableCol[];
  mergeCells?: VxeTablePropTypes.MergeCell[];
  data: RowData[];
}
