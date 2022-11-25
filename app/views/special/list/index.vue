<template>
  <div class="h-layout-full p-4 gap-4 children:shadow-md children:rounded-md">
    <div class="h-full p-2 bg-white">
      <BasicTable @register="registerTable" class="h-full">
        <template #tableTitle>
          <div class="w-300px">
            <InputSearch
              v-model:value="searchWordRef"
              @search="handleSearch"
              placeholder="搜索名称"
            />
          </div>
        </template>
        <template #toolbar>
          <a-button type="primary" preIcon="ant-design:reload-outlined" @click="handleReload">
            刷新
          </a-button>
        </template>
        <template #action="{ record }">
          <TableAction :actions="actions(record)" />
        </template>
      </BasicTable>
      <!-- 预览弹窗 -->
      <ModelPreview @register="registerModelPreview" />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Input } from 'ant-design-vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { getBasicColumns } from './tableData';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getSpecialList, SpecialDelete } from '@dq-next/http-apis/special/index';
  import { useUserStore } from '/@/store/modules/user';
  import ModelPreview from './components/ModelPreview.vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { recordModel } from './model';
  import type { UserInfo } from '/#/store';
  export default defineComponent({
    name: 'List',
    components: { BasicTable, TableAction, InputSearch: Input.Search, ModelPreview },
    setup() {
      const go = useGo();
      const searchWordRef = ref('');
      const [registerModelPreview, { openModal: openModal, setModalProps }] = useModal();
      const [registerTable, { reload }] = useTable({
        api: getSpecialList,
        searchInfo: {
          name: searchWordRef,
          type: '',
          userName: '',
        },
        columns: getBasicColumns(),
        actionColumn: {
          width: 200,
          title: '操作',
          dataIndex: 'action',
        },
        canResize: true,
      });
      async function handleDelete(record: recordModel) {
        console.log(record);
        const { createConfirm } = useMessage();
        createConfirm({
          iconType: 'warning',
          title: '删除',
          content: `确认删除“${record.specialName}”吗？`,
          onOk: async () => {
            await SpecialDelete({ id: record.id });
            reload();
          },
        });
      }
      function handlePreview(record: recordModel) {
        setModalProps({
          title: record.specialName,
          canFullscreen: true,
        });
        openModal(true, record);
      }
      function handleEdit(record: recordModel) {
        if (record.specialType == 'jodi') {
          go(`/special/jodi?id=${record.id}`);
        } else if (record.specialType == 'vessel IMP&EXP') {
          go(`/special/vesselImport?id=${record.id}`);
        } else if (record.specialType == 'vessel report') {
          go(`/special/vessel?id=${record.id}`);
        }
      }
      // 刷新
      function handleReload() {
        reload({
          page: 1,
        });
      }
      //删除权限控制
      const userStore = useUserStore();
      const userInfo: UserInfo = userStore.getUserInfo;
      function actions(record: recordModel) {
        if (userInfo.roleIdList[0] == 1 || record.userId == userInfo.userId) {
          return [
            {
              label: '预览',
              icon: 'ant-design:file-search-outlined',
              onClick: handlePreview.bind(null, record),
            },
            {
              label: '修改',
              icon: 'ant-design:edit-outlined',
              onClick: handleEdit.bind(null, record),
            },
            {
              label: '删除',
              icon: 'ant-design:delete-outlined',
              onClick: handleDelete.bind(null, record),
            },
          ];
        } else {
          return [
            {
              label: '预览',
              icon: 'ant-design:file-search-outlined',
              onClick: handlePreview.bind(null, record),
            },
          ];
        }
      }
      function handleSearch(key) {
        searchWordRef.value = key;
        reload();
      }
      return {
        registerTable,
        handleReload,
        actions,
        registerModelPreview,
        searchWordRef,
        handleSearch,
      };
    },
  });
</script>

<style></style>
