import { cloneDeep } from 'lodash-es';
import { jsonToSheetXlsx } from '../../Excel';
import { getQuotaData, quotaDataExportTypeEnum } from '@dq-next/http-apis/quota';
import { getQuotaDataResult } from '@dq-next/http-apis/quota/model';
import { useI18n } from '/@/hooks/web/useI18n';
import { formatToDate, toTimeStamp } from '@dq-next/utils/dateUtil';
import { SelectedQuotaItem } from '/@/views/quota/quotaView/components/hooks';

const { t } = useI18n();

type useDownloadXLSXRes = {
  fetchData: (rows: SelectedQuotaItem[], dateStr: string[]) => Promise<getQuotaDataResult[]>;
  downloadXLSX: () => void;
  getTableData: () => { tableData: Recordable<any>[]; names: string[]; ids: number[] };
};
export function useDownloadXLSX(): useDownloadXLSXRes {
  let quotaData: getQuotaDataResult[];
  let tableData: Recordable<any>[];
  async function fetchData(rows: SelectedQuotaItem[], dateStr: string[]) {
    quotaData = await getQuotaData({
      startDate: dateStr[0],
      endDate: dateStr[1],
      exportPara: quotaDataExportTypeEnum.JSON,
      rows,
    });
    return quotaData;
  }

  // 制作表格数据
  function getTableData() {
    const dataArr = cloneDeep(quotaData);
    const dateColName = t('quotaView.doubleSideChart.quotaDataTableHeader.date');
    const names: string[] = [dateColName];
    const ids: number[] = [];
    const dataSource: Recordable[] = [];
    for (let i = 0; i < dataArr.length; i++) {
      const piece = dataArr[i];
      const arrayData = piece.data;
      if (!names.includes(piece.name)) {
        ids.push(piece.id);
        names.push(piece.name);
      }
      while (arrayData.length) {
        // 判断是否存在同日期数据行
        const date = formatToDate(arrayData[0][0]);
        const d = dataSource.find((_) => _[dateColName] === date);
        if (d !== undefined) {
          // 存在补全数据
          d[piece.name] = arrayData[0][1];
        } else {
          // 不存在就构造新行
          const single = {
            [dateColName]: date,
            [piece.name]: arrayData[0][1],
          };
          dataSource.push(single);
        }
        // 移除用过的数据
        arrayData.shift();
      }
    }
    // 最新的日子搁上头
    tableData = dataSource.sort((a, b) => {
      return toTimeStamp(b[dateColName]) - toTimeStamp(a[dateColName]);
    });
    return { tableData, names, ids };
  }

  // 生成xlsx
  function downloadXLSX() {
    jsonToSheetXlsx({
      data: tableData,
      filename: '导出.xlsx',
    });
  }
  return { fetchData, downloadXLSX, getTableData };
}
