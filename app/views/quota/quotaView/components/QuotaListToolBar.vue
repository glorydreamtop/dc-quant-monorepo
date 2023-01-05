<template>
  <div class="flex gap-3 w-fit bar">
    <Tooltip placement="top">
      <template #title>{{ t('quotaView.quotaList.formula') }}</template>
      <Icon icon="carbon:function-math" size="20" @click="addFormula" />
    </Tooltip>
    <Tooltip placement="top">
      <template #title>{{ t('quotaView.quotaList.delChecked') }}</template>
      <Icon
        icon="ant-design:delete-outlined"
        size="20"
        @click="clear"
        data-type="delete"
        class="delete-shake"
      />
    </Tooltip>
    <Tooltip placement="top">
      <template #title>{{ t('quotaView.quotaList.checkAll') }}</template>
      <Icon icon="ant-design:check-outlined" size="20" @click="checkAll" />
    </Tooltip>
    <Tooltip placement="top">
      <template #title>{{ t('quotaView.quotaList.readClipBoard') }}</template>
      <Icon icon="fluent:clipboard-paste-16-regular" size="20" @click="readClipBoard" />
    </Tooltip>
    <Tooltip placement="top">
      <template #title>{{ t('quotaView.quotaList.updateQuota') }}</template>
      <Icon icon="ant-design:sync-outlined" size="20" @click="updateQuota" />
    </Tooltip>
  </div>
</template>

<script lang="ts" setup>
  import { requestUpdateQuotaData } from '@dq-next/http-apis/quota';
  import { Icon } from '@dq-next/icon';
  import { remove } from 'lodash-es';
  import { Tooltip } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useSelectedQuotaListContext } from './hooks';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { SelectedQuotaItem } from '/#/quota';
  import { buildShortUUID } from '@dq-next/utils';
  import { SourceTypeEnum } from '/@/enums/quotaEnum';

  const emit = defineEmits<{
    (event: 'addFormula'): void;
    (event: 'updateQuota', state: boolean): void;
  }>();
  const { t } = useI18n();
  const { createMessage } = useMessage();

  // 所有从树中选中的指标
  const selectedQuota = useSelectedQuotaListContext();

  // 全选/取消全选
  function checkAll() {
    const b = selectedQuota.value.every((q) => q.selected);
    selectedQuota.value.forEach((q) => {
      q.selected = !b;
    });
  }

  function addFormula() {
    emit('addFormula');
  }

  // 更新选中指标
  async function updateQuota() {
    const obj = {};
    // 按目录分组
    selectedQuota.value.forEach((quota) => {
      if (quota.selected && !!quota.id) {
        if (Reflect.has(obj, quota.categoryId!)) {
          obj[quota.categoryId!].push(quota.id);
        } else {
          obj[quota.categoryId!] = [quota.id];
        }
      }
    });
    const arr: Promise<any>[] = [];
    for (let key in obj) {
      arr.push(requestUpdateQuotaData({ categoryId: parseInt(key), indexIdList: obj[key] }));
    }
    try {
      emit('updateQuota', true);
      // 并发分组更新请求
      const res = await Promise.allSettled(arr);
      createMessage.success(res[0].value.msg);
    } catch (error) {
      createMessage.error(error);
    } finally {
      emit('updateQuota', false);
    }
  }

  function clear() {
    remove(selectedQuota.value, (quota) => quota.selected === true);
    createMessage.success(t('quotaView.quotaCard.alldel'));
  }
  async function readClipBoard() {
    const str = await navigator.clipboard.readText();
    const [firstLine, ...l] = str.split('\r\n');
    const lines = remove(l, (s) => s.length > 0);
    const keys = firstLine.split('\t');
    const [, , ...skeys] = keys;
    for (const line of lines) {
      const f: Indexable<string> = {};
      line.split('\t').map((v, idx) => {
        f[keys[idx]] = v;
      });
      skeys.forEach((sk) => {
        const reg = `#${sk}#`;
        f['name'] = f['name'].replace(reg, f[sk]);
        f['formula'] = f['formula'].replace(reg, f[sk]);
      });
      const quota: SelectedQuotaItem = {
        id: buildShortUUID('formula'),
        name: f['name'],
        sourceCode: f['formula'],
        sourceType: SourceTypeEnum.formula,
        selected: true,
      };
      selectedQuota.value.push(quota);
    }
  }
</script>

<style lang="less" scoped>
  .bar {
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0px;
      height: 100%;
      border-right: 4px solid lighten(@primary-color, 15);
    }

    .app-iconify {
      transform: scale(1);
      transition: all 0.2s;
      transform-origin: 50% 100%;

      &:hover {
        transform: scale(1.4);
        color: @primary-color;
      }
    }
  }
</style>
