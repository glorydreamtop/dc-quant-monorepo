<template>
  <div>
    <div class="flex flex-wrap gap-2 pb-2 border-b border-gray-200 toolbar">
      <div class="flex gap-2 divide divide-x">
        <div class="func-btn" @click="checkAll">
          <Icon icon="ant-design:check-outlined" />
          <span>{{ t('quotaView.quotaList.checkAll') }}</span>
        </div>
        <div @click="clear" :disabled="!allowDel" class="delete-shake func-btn">
          <Icon icon="ant-design:stop-outlined" />
          <span>{{ t('quotaView.quotaList.delChecked') }}</span>
        </div>
        <div class="func-btn" @click="del" :disabled="!allowDel">
          <Icon icon="ant-design:delete-outlined" />
          <span>{{ t('quotaView.management.delete') }}</span>
        </div>
        <div class="func-btn" @click="updateQuota" :disabled="!allowDel">
          <Icon icon="ant-design:sync-outlined" />
          <span>{{ t('quotaView.quotaList.updateQuota') }}</span>
        </div>
        <div class="func-btn" @click="clearData" :disabled="!allowDel">
          <Icon icon="ant-design:clear-outlined" />
          <span>{{ t('quotaView.management.clearData.btn') }}</span>
        </div>
        <div class="func-btn" :disabled="!allowCalcData" @click="calcData">
          <Icon icon="ant-design:calculator-outlined" />
          <span>{{ t('quotaView.management.calcData.btn') }}</span>
        </div>
        <Popover placement="bottom" trigger="click">
          <div class="func-btn" @click="moveQuotaTo" :disabled="!allowDel">
            <Icon icon="ant-design:folder-outlined" />
            <span>{{ t('quotaView.management.move.btn') }}</span>
          </div>
          <template #content>
            <div>
              <TreeSelect
                class="w-90"
                v-model:value="treeProps.val"
                :treeData="treeProps.treeData"
                :fieldNames="{ title: 'name', value: 'id' }"
                optionLabelProp="label"
              />
              <Button
                :disabled="treeProps.val === 0"
                type="primary"
                class="ml-1"
                @click="handleMoveQuota"
                >{{ t('common.okText') }}</Button
              >
            </div>
          </template>
        </Popover>
      </div>
      <Button class="ml-auto" @click="search">
        <template #icon>
          <Icon icon="ant-design:search-outlined" />
        </template>
        <span>{{ t('quotaView.management.search.btn') }}</span>
      </Button>
    </div>
    <AdvanceSearch @register="avanceSearchModal" @pushQuota="pushQuota" />
    <ClearModal @register="clearModal" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, computed } from 'vue';
  import type { CategoryTreeModel, QuotaItem } from '/#/quota';
  import { Button, Modal, Popover, TreeSelect } from 'ant-design-vue';
  import { Icon } from '@dq-next/icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { emitter } from '/@/components/QuotaTree/hooks';
  import { useQuotaListContext, useSelectedQuotaContext } from '../hooks';
  import { AdvanceSearch } from '/@/components/QuotaTree';
  import ClearModal from './ClearModal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { today } from '@dq-next/utils/dateUtil';
  import {
    delQuota,
    delQuotaData,
    getQuotaInfo,
    moveQuota,
    requestUpdateQuotaData,
  } from '@dq-next/http-apis/quota';
  import { SourceTypeEnum } from '/@/enums/quotaEnum';
  import { useModal } from '/@/components/Modal';
  import { useQuotaTreeStore } from '/@/store/modules/quotaTree';
  import { filter } from '@dq-next/utils/helper/treeHelper';
  import { cloneDeep, remove } from 'lodash-es';

  // 所有从树中选中的指标
  const selectedQuota = useSelectedQuotaContext();
  // 勾选的指标
  const quotaList = useQuotaListContext();
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [avanceSearchModal, { openModal: openAvanceSearchModal }] = useModal();
  const [clearModal, { openModal: openClearModal, setModalProps: setClearModalProps }] = useModal();

  // 全选/取消全选
  function checkAll() {
    const b = selectedQuota.value.every((q) => q.selected);
    selectedQuota.value.forEach((q) => {
      q.selected = !b;
    });
  }
  // 用于指标移动的指标目录树
  const treeProps = reactive<{ treeData: CategoryTreeModel[]; val: unknown }>({
    treeData: [],
    val: undefined,
  });
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
      // 并发分组更新请求
      const res = await Promise.allSettled(arr);
      createMessage.success(res[0].value.msg);
    } catch (error) {
      createMessage.error(error);
    } finally {
      loading.value = false;
    }
    updateQuotaInfo();
  }
  async function updateQuotaInfo(quota?: QuotaItem) {
    if (quota) {
      try {
        const res = await getQuotaInfo({ indexId: quota.id });
        const q = selectedQuota.value.find((q) => q.id === quota.id)!;
        Object.assign(q, res);
      } catch (error) {
      } finally {
      }
      return;
    }
    const ql = cloneDeep(quotaList.value);
    try {
      for (let index = 0; index < ql.length; index++) {
        const q = ql[index];
        const res = await getQuotaInfo({ indexId: q.id });
        const quota = selectedQuota.value.find((quota) => quota.id === q.id)!;
        Object.assign(quota, res);
      }
      emitter.emit('updateTree');
    } catch (error) {
    } finally {
      loading.value = false;
    }
  }
  function clear() {
    remove(selectedQuota.value, (quota) => quota.selected === true);
    createMessage.success(t('quotaView.quotaCard.alldel'));
  }
  const allowDel = computed(() => {
    return quotaList.value.length > 0;
  });
  function del() {
    Modal.confirm({
      title: t('quotaView.management.deleteConfirmTip'),
      onOk: async () => {
        const pl: any[] = [];
        const ql = cloneDeep(quotaList.value);
        for (let index = 0; index < ql.length; index++) {
          const q = ql[index];
          pl.push(
            delQuota({
              indexId: q.id,
            }),
          );
        }
        try {
          await Promise.allSettled(pl);
          createMessage.success('删除成功');
          remove(selectedQuota.value, (q) => ql.some((_q) => _q.id === q.id));
          emitter.emit('updateTree');
        } catch (error) {
          createMessage.error(error);
        }
      },
    });
  }
  function search() {
    openAvanceSearchModal(true);
  }
  function pushQuota(list: QuotaItem[]) {
    list.forEach((item) => {
      const hasQuota = selectedQuota.value.some((q) => q.id === item.id);
      if (!hasQuota) {
        selectedQuota.value.push(item);
      }
    });
  }
  // 清除数据
  function clearData() {
    openClearModal(true, quotaList.value);
    setClearModalProps({
      afterClose: () => {
        updateQuotaInfo();
      },
    });
  }
  const allowCalcData = computed(() => {
    return (
      quotaList.value.length > 0 &&
      quotaList.value.every((item) => item.sourceType === SourceTypeEnum.formula)
    );
  });
  // 重算数据
  async function calcData() {
    try {
      await delQuotaData({
        indexList: quotaList.value.map((q) => q.id).join(','),
        startDate: '2000-01-01',
        endDate: today(),
      });
      await updateQuota();
    } catch (error) {
      createMessage.error(error);
    }
  }
  const store = useQuotaTreeStore();
  // 打开批量移动的popover
  function moveQuotaTo() {
    treeProps.treeData = filter(
      [...store.getSysQuotaTree, ...store.getUserQuotaTree],
      (node) => node.folder,
    );
  }
  // 批量移动
  async function handleMoveQuota() {
    const res = await moveQuota({
      categoryId: treeProps.val,
      indexIdList: quotaList.value.map((q) => q.id),
    });
    createMessage.success(res);
    updateQuotaInfo();
  }
</script>

<style lang="less" scoped>
  .quota-list-move {
    transition: transform 0.5s ease;
  }

  .quota-list-item {
    transition-property: transform, background-color;
    transition-duration: 0.5s;
    transition-timing-function: ease;
  }

  .quota-list-leave-active {
    transition: 0.8s ease;
    transition-property: opacity, transform;
    position: absolute !important;
  }

  .quota-list-leave-to {
    opacity: 0%;
    transform: translateX(-100px);
  }

  .quota-list-leave-from {
    opacity: 100%;
    transform: translateX(0);
  }

  .list-theme {
    @apply w-auto gap-4 px-3 text-sm;

    .drag-handler {
      @apply items-center;
    }

    .quota-unit-sourceType {
      .unit,
      .sourceType {
        @apply w-20 text-center truncate;
      }
    }
  }

  .func-btn {
    @apply flex items-center pl-2 cursor-pointer;

    transition-duration: 0.3s;
    transition-property: color;

    &::before {
      @apply rounded-sm;

      content: '';
      width: 100%;
      height: 100%;
      padding-left: 10px;
      margin-right: calc(-100% + 4px);
      transition-duration: 0.3s;
      transition-property: background-color, color;
    }

    &:hover {
      color: @primary-color;

      &::before {
        @apply bg-primary-50;
      }
    }
  }
</style>
