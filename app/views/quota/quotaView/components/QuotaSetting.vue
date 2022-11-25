<template>
  <BasicModal @register="register" @ok="ok" @cancel="close">
    <div class="w-full flex flex-col gap-4 children:flex children:gap-2 children:items-center">
      <div>
        <span class="min-w-4em">{{ t('quotaView.quotaSetting.name') }}</span>
        <Input v-model:value="quotaSetting.name" />
      </div>
      <div v-show="quotaSetting.sourceType !== 'formula'">
        <span class="min-w-4em">{{ t('quotaView.quotaSetting.sourceCode') }}</span>
        <Input v-model:value="quotaSetting.sourceCode">
          <template #suffix>
            <span class="text-primary">{{
              t(`quota.sourceType.${quotaSetting['sourceType']}`)
            }}</span>
          </template>
        </Input>
      </div>
      <template v-if="quotaSetting.sourceType === 'formula'">
        <div>
          <span class="min-w-4em">{{ t('quotaView.quotaSetting.formula') }}</span>
          <Editor
            class="w-full"
            v-model:formula="quotaSetting.sourceCode"
            @updateEndOffset="updateEndOffset"
          />
        </div>
        <div v-if="quotaList.length > 0">
          <span>{{ t('quotaView.quotaSetting.autofill') }}</span>
          <div class="flex flex-wrap items-center gap-1 w-74">
            <span
              v-for="item in quotaList"
              :key="item.id"
              class="rounded-sm overflow-hidden cursor-pointer bg-primary-400 text-white px-1 relative"
            >
              <span @click="fillFormula(item, 'id')">{{ item.shortName || item.name }}</span>
              <span
                v-show="item.sourceType === 'formula'"
                @click="fillFormula(item, 'sourceCode')"
                class="absolute -left-1/5 top-0 w-7/10 bg-gray-100 h-full opacity-45 skew-x-165 transform"
              ></span>
            </span>
            <BasicHelp :text="t('quotaView.quotaSetting.autofillTip')" />
          </div>
        </div>
      </template>

      <!-- <div>
        <span class="min-w-4em">{{ t('quotaView.quotaSetting.setting.yAxisIndex') }}</span>
        <Select
          class="w-80"
          v-model:value="quotaSetting.setting.yAxisIndex"
          :options="yAxisIndexList"
        />
      </div>
      <div>
        <span class="min-w-4em">{{ t('quotaView.quotaSetting.setting.type') }}</span>
        <Select class="w-80" v-model:value="quotaSetting.setting.type">
          <Option v-for="seriesType in seriesTypeList" :key="seriesType.value">
            <div>
              <Icon :color="getThemeColor" :icon="seriesType.icon" />
              <span class="ml-2">{{ seriesType.label }}</span>
            </div>
          </Option>
        </Select>
      </div> -->
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { SelectedQuotaItem, useSelectedQuotaListContext } from './hooks';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Input } from 'ant-design-vue';
  import { reactive, ref, nextTick } from 'vue';
  import { BasicHelp } from '/@/components/Basic';
  import { SourceTypeEnum } from '/@/enums/quotaEnum';
  import { cloneDeep } from 'lodash-es';
  import { Editor } from '/@/components/FormulaEditor';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { QuotaItem } from '/#/quota';
  import { buildShortUUID } from '@dq-next/utils/uuid';

  const { t } = useI18n();
  const quotaList = useSelectedQuotaListContext();
  const quotaIndex = ref(0);
  const defaultSetting = {
    name: '',
    sourceCode: '',
    sourceType: SourceTypeEnum.formula,
  };
  const { createMessage } = useMessage();
  const quotaSetting: Pick<SelectedQuotaItem, 'name' | 'sourceCode' | 'sourceType'> = reactive(
    cloneDeep(defaultSetting),
  );

  const [register, { closeModal }] = useModalInner(
    ({ record, index }: { record: SelectedQuotaItem; index?: number }) => {
      quotaIndex.value = index ?? quotaList.value.length;
      Object.assign(quotaSetting, record);
    },
  );
  function close() {
    for (const key in quotaSetting) {
      quotaSetting[key] = defaultSetting[key];
    }
    closeModal();
  }
  function ok() {
    if (quotaSetting.name.trim().length === 0) {
      createMessage.warn(t('quotaView.quotaSetting.noName'));
      return;
    }
    if (quotaIndex.value === quotaList.value.length) {
      quotaList.value.push({
        ...cloneDeep(quotaSetting),
        id: buildShortUUID('formula'),
      } as SelectedQuotaItem);
    } else {
      Object.assign(quotaList.value[quotaIndex.value], quotaSetting);
    }
    close();
  }
  const endOffset = ref(0);
  function updateEndOffset(v) {
    endOffset.value = v;
  }
  async function fillFormula(item: QuotaItem, key: 'id' | 'sourceCode') {
    let str = '';
    if (key === 'id') {
      if (!!item.id) {
        str = `idx(${item.id})`;
      } else {
        createMessage.warn(t('quotaView.quotaSetting.formulaWithoutId'));
      }
    } else {
      str = item.sourceCode;
    }
    quotaSetting.sourceCode =
      quotaSetting.sourceCode.slice(0, endOffset.value) +
      str +
      quotaSetting.sourceCode.slice(endOffset.value);
    await nextTick();
    const dom = document.getElementsByClassName('formula-editor')[0] as HTMLInputElement;
    dom.focus();
    const focusDOM = window.getSelection()!.getRangeAt(0)!;
    // 设置光标位置
    focusDOM.setStart(dom.childNodes[0], endOffset.value + str.length);
    focusDOM.collapse(true);
  }
</script>

<style lang="less" scoped></style>
