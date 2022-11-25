<template>
  <div class="h-layout-full p-4 flex flex-col gap-4">
    <ToolBar @update-report-list="updateReportList" />
    <div class="bg-white p-4">
      <BasicTable @register="registerTable">
        <template #action="{ record }">
          <TableAction :actions="actions(record)" />
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { h } from 'vue';
  import type { BasicPageParams } from '@dq-next/http-apis/model/baseModel';
  import { useI18n } from '/@/hooks/web/useI18n';
  import ToolBar from './components/ToolBar.vue';
  import { getColumns } from './columns';
  import { BasicTable, useTable, TableAction, ActionItem } from '/@/components/Table';
  import { getRem } from '@dq-next/utils/domUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getReportList, delReport } from '@dq-next/http-apis/report';
  import { isAdmin, isOwner } from '/@/store/modules/user';

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const [registerTable, { setPagination, reload }] = useTable({
    columns: getColumns(),
    api: getRoportListData,
    pagination: {
      pageSize: 20,
    },
    resizeHeightOffset: getRem() * 1,
    actionColumn: {
      width: 200,
      title: t('common.action'),
      dataIndex: 'action',
      fixed: 'right',
    },
  });

  const actions = function (record): ActionItem[] {
    return [
      {
        icon: 'ant-design:eye-outlined',
        label: t('report.reportList.actions.openLink'),
        onClick: () => {},
      },
      {
        icon: 'ant-design:share-alt-outlined',
        label: t('report.reportList.actions.copyLink'),
        onClick: () => {},
      },
      {
        icon: 'ant-design:delete-outlined',
        disabled: isAdmin() || isOwner(record.userId),
        popConfirm: {
          title: () => {
            // @ts-ignore
            return h('div', { class: 'flex flex-col items-center' }, [
              h('span', t('report.reportList.actions.delReportConfirm')),
              h('span', { class: 'font-bold' }, `《${record.reportName}》`),
            ]);
          },
          confirm: async () => {
            const res = await delReport({ id: record.id });
            createMessage.success(res);
          },
        },
      },
    ];
  };
  async function getRoportListData(pageParams: BasicPageParams) {
    const res = await getReportList({
      ...pageParams,
    });
    res.list.forEach((report) => {
      report.createTime.replace('T', ' ');
    });
    setPagination({
      pageSize: res.pageSize,
      current: res.currPage,
      total: res.totalCount,
    });
    return res;
  }
  function updateReportList(searchInfo) {
    reload({
      searchInfo,
    });
  }
</script>

<style lang="less" scoped>
  .label {
    &::after {
      content: ':';
    }
  }

  ::v-deep(.ant-table-body) {
    .report-name {
      @apply font-bold;
    }

    .report-id {
      @apply text-gray-400 italic;
    }

    .report-pdf {
      position: relative;

      .pdf-file {
        position: absolute;
        left: calc(50% - 14px);
        top: calc(50% - 14px);
        z-index: 99;
        background-color: @white;
        transition: background-color 0.2s;
        display: inline-block !important;
      }

      .pdf-redo {
        position: absolute;
        left: calc(50% - 11px);
        top: calc(50% - 11px);
        z-index: 9;
        transform: translateX(0) rotate(0deg);
        transition: transform 0.5s ease-in-out 0.3s;

        &.pdf-redo-doing {
          transform: translateX(120%) rotate(280deg);
        }

        &.pdf-redo-done {
          transform: translateX(0) rotate(0deg);
        }
      }
    }

    .ant-table-row:hover {
      .pdf-file {
        background-color: @table-selected-row-bg;
      }

      .pdf-redo {
        transform: translateX(120%) rotate(280deg);
      }
    }
  }
</style>
