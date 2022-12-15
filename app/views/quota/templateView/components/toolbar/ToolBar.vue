<template>
  <div class="flex items-center justify-between p-2 bg-white border hover:shadow toolbar">
    <Tabs v-model:activeKey="menuList.key" size="small">
      <TabPane
        key="pageConfig"
        :tab="t('templateView.toolbar.toolBarMenu.pageConfig')"
        class="flex items-center gap-4"
      >
        <PageConfig />
      </TabPane>
      <TabPane key="edit" :tab="t('templateView.toolbar.toolBarMenu.edit')" class="flex gap-4">
        <ToolBarEdit />
      </TabPane>
      <TabPane key="insert" :tab="t('templateView.toolbar.toolBarMenu.insert')" class="flex gap-4">
        <Button size="small" @click="dispatch('insertText')">{{
          t('templateView.toolbar.insertText.btn')
        }}</Button>
        <BasicUpload
          :maxSize="6"
          :maxNumber="12"
          @change="uploadFileChange"
          :api="uploadApi"
          size="small"
          v-model:value="imgList"
        >
          <template #btn="{ onClick }">
            <Button size="small" @click="onClick">{{
              t('templateView.toolbar.insertImg.btn')
            }}</Button>
          </template>
        </BasicUpload>
      </TabPane>
    </Tabs>
    <!-- <div class="flex items-center justify-between gap-1">
      <Button
        :disabled="pageSetting.pagination"
        size="small"
        type="primary"
        :loading="saveImgLoading"
        @click="dispatch('saveImg')"
        >{{ t('templateView.toolbar.save.img') }}</Button
      >
      <Button
        size="small"
        :disabled="!pageSetting.pagination"
        type="primary"
        @click="dispatch('savePdf')"
        >{{ t('templateView.toolbar.save.pdf') }}</Button
      >
    </div> -->
  </div>
</template>

<script lang="ts" setup>
  import { Button, Tabs } from 'ant-design-vue';
  import { cloneDeep, remove } from 'lodash-es';
  import { reactive, ref, nextTick } from 'vue';
  import { useUniqueField } from '../../../quotaTable/components/helper';
  import {
    textTemplate,
    imgTemplate,
    useSelectTemplateListContext,
    useTemplateListContext,
    useUniqIdContext,
    insertDOM,
  } from '../../hooks';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { dom2imgFile, fileType } from '@dq-next/utils/domUtils';
  import { downloadByData } from '@dq-next/utils/file';
  import { BasicUpload } from '/@/components/Upload';
  import PageConfig from './ToolBarPageConfig.vue';
  import ToolBarEdit from './ToolBarEdit.vue';
  import { uploadApi } from '@dq-next/http-apis/sys/upload';
  import type { ImgConfig } from '/#/template';

  const TabPane = Tabs.TabPane;
  const { t } = useI18n();
  const menuList = reactive({
    list: ['pageConfig', 'edit', 'insert', 'tool'],
    key: 'edit',
  });
  // 已选中的节点
  const selectedTemplateList = useSelectTemplateListContext();
  // 所有节点
  const templateList = useTemplateListContext();
  // 使用的节点key
  const usedUniqId = useUniqIdContext();
  const { getUniqueField } = useUniqueField(usedUniqId.value);
  const saveImgLoading = ref(false);
  async function dispatch(eventName: string) {
    switch (eventName) {
      case 'insertText':
        const text = cloneDeep(textTemplate);
        text.uniqId = getUniqueField();
        insertDOM(templateList, selectedTemplateList, text);
        break;
      case 'remove':
        remove(templateList.value, (t) => {
          if (t.type === 'Img') {
            remove(imgList.value, (url) => url === t.config.url);
          }
          return selectedTemplateList.value.some((temp) => t.uniqId === temp.uniqId);
        });
        break;
      case 'saveImg':
        selectedTemplateList.value = [];
        saveImgLoading.value = true;
        await nextTick();
        const blobObj = await dom2imgFile({
          dom: document.getElementById('page-box')!.getElementsByClassName('pages')[0]!,
          type: fileType.BLOB,
          scale: 4,
        });
        downloadByData(blobObj, 'report.jpg');
        saveImgLoading.value = false;
        break;
      default:
        break;
    }
  }
  const imgList = ref<string[]>([]);
  function uploadFileChange(fileList: string[]) {
    fileList.forEach((url) => {
      const img = cloneDeep(imgTemplate);
      (img.config as ImgConfig).url = url;
      img.uniqId = getUniqueField();
      insertDOM(templateList, selectedTemplateList, img);
    });
  }
</script>

<style lang="less" scoped>
  .toolbar {
    transition-property: transform box-shadow;
    transition-duration: 0.2s;
  }

  ::v-deep(.ant-tabs .ant-tabs-small-bar .ant-tabs-tab) {
    padding-top: 0px;
    padding-bottom: 6px;
  }

  ::v-deep(.ant-tabs-bar) {
    margin-bottom: 8px;
  }
</style>
