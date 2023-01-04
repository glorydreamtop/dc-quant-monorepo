<template>
  <div class="h-layout-full p-4 flex flex-col gap-4">
    <ToolBar @update-user-list="updateUserList" />
    <div class="bg-white p-4">
      <BasicTable @register="registerTable" @edit-end="editCellEnd">
        <template #action="{ record }">
          <TableAction :actions="actions(record)" />
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, h } from 'vue';
  import { getUserList, updateUserInfo } from '@dq-next/http-apis/sys/user';
  import type { BasicPageParams } from '@dq-next/http-apis/model/baseModel';
  import { useI18n } from '/@/hooks/web/useI18n';
  import ToolBar from './components/ToolBar.vue';
  import { Input } from 'ant-design-vue';
  import { getColumns } from './columns';
  import { BasicTable, useTable, TableAction, ActionItem } from '/@/components/Table';
  import { getRem } from '@dq-next/utils/domUtils';
  import { isEmpty, isNull } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { UserInfo } from '/#/store';

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const [registerTable, { setPagination, reload }] = useTable({
    columns: getColumns(),
    api: getUserListData,
    bordered: true,
    pagination: {
      pageSize: 100,
    },
    resizeHeightOffset: getRem() * 1,
    actionColumn: {
      width: 160,
      title: t('common.action'),
      dataIndex: 'action',
    },
  });
  const actions = function (record: UserInfo): ActionItem[] {
    const resetPwdText = ref('');
    return [
      {
        icon: 'ant-design:lock-outlined',
        label: t('sys.user.resetPwd'),
        popConfirm: {
          title: h(Input, {
            type: 'text',
            size: 'small',
            defaultValue: resetPwdText,
            placeholder: t('sys.login.passwordPlaceholder'),
            onInput: (e: ChangeEvent) => (resetPwdText.value = e.target.value),
          }),
          confirm: async () => {
            if (!resetPwdText.value) return;
            const msg = await updateUserInfo({
              userId: record.userId,
              password: resetPwdText.value,
            });
            createMessage.success(msg);
            resetPwdText.value = '';
          },
          cancel: () => {
            resetPwdText.value = '';
          },
        },
      },
      {
        icon: 'ant-design:delete-outlined',
        label: t('common.delText'),
      },
    ];
  };
  async function getUserListData(pageParams: BasicPageParams<Partial<UserInfo>>) {
    const res = await getUserList({
      ...pageParams,
    });
    setPagination({
      pageSize: res.pageSize,
      current: res.currPage,
      total: res.totalCount,
    });
    return res;
  }

  async function editCellEnd({ key, value, record }) {
    if (isEmpty(value) || isNull(value)) return;
    // 带上userId，他们的token解不出来userId，绝了
    const msg = await updateUserInfo({ [key]: value, userId: record.userId });
    createMessage.success(msg);
  }
  async function updateUserList(searchInfo: Partial<UserInfo>) {
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
</style>
