import { BasicColumn } from '/@/components/Table';
import { Tooltip } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { isEmpty, isNull } from '@dq-next/utils/is';
import { Icon } from '@dq-next/icon';
import { openWindow } from '@dq-next/utils';
import { downloadByUrl } from '@dq-next/utils/file/download';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { generatePDF } from '@dq-next/http-apis/report';
import { ref } from 'vue';
import { sleep } from '@dq-next/utils/helper/commonHelper';

const { t } = useI18n();
const { getColorScheme } = useRootSetting();
const [, , jpgColor, , pdfColor] = getColorScheme.value;

export function getColumns(): BasicColumn[] {
  return [
    {
      title: t('report.reportList.list.id'),
      dataIndex: 'id',
      width: 120,
      className: 'report-id',
    },
    {
      title: t('report.reportList.list.reportName'),
      dataIndex: 'reportName',
      className: 'report-name',
    },
    {
      title: t('report.reportList.list.reportFile'),
      dataIndex: 'reportFile',
      width: 200,
      className: 'report-pdf',
      customRender: ({ record }) => {
        const url = record.reportFile;
        const doing = Reflect.has(makePDFTaskPool.value, record.id);
        const locked = Reflect.has(makePDFLocked.value, record.id);
        if (!isNull(url) && !isEmpty(url)) {
          return (
            <div>
              <Icon
                class="pdf-file cursor-pointer"
                icon="ant-design:file-pdf-twotone"
                color={pdfColor}
                onClick={downloadByUrl.bind(null, {
                  url,
                  fileName: `${record.reportName}.pdf`,
                  sameSite: false,
                })}
                size={28}
              />
              <Tooltip title={t('report.reportList.actions.redoPDF')}>
                <div
                  class={`pdf-redo cursor-pointer ${locked ? 'pdf-redo-doing' : 'pdf-redo-done'}`}
                >
                  <Icon
                    icon="ant-design:redo-outlined"
                    spin={doing}
                    size={22}
                    onClick={makePDF.bind(null, record.id)}
                  />
                </div>
              </Tooltip>
            </div>
          );
        }
      },
    },
    {
      title: t('report.reportList.list.reportScreenshot'),
      dataIndex: 'reportScreenshot',
      width: 100,
      customRender: ({ record }) => {
        const url = record.reportScreenshot;
        if (!isNull(url) && !isEmpty(url)) {
          return (
            <div class="text-center w-3/5 mx-auto cursor-pointer">
              <Icon
                icon="ant-design:file-image-twotone"
                color={jpgColor}
                onClick={openWindow.bind(null, url)}
                size={28}
              />
            </div>
          );
        }
      },
    },
    {
      title: t('report.reportList.list.userName'),
      dataIndex: 'userName',
    },
    {
      title: t('report.reportList.list.productName'),
      dataIndex: 'productName',
      width: 120,
    },
    {
      title: t('report.reportList.list.createTime'),
      dataIndex: 'createTime',
      width: 160,
    },
  ];
}

const makePDFTaskPool = ref<{ [id: number]: Symbol }>({});
const makePDFLocked = ref<{ [id: number]: Symbol }>({});

async function makePDF(id: number) {
  if (makePDFTaskPool.value[id]) return;
  try {
    makePDFTaskPool.value[id] = Symbol();
    makePDFLocked.value[id] = Symbol();
    await generatePDF({ id });
  } catch {
  } finally {
    Reflect.deleteProperty(makePDFTaskPool.value, id);
    await sleep(1000);
    Reflect.deleteProperty(makePDFLocked.value, id);
  }
}
