<template>
  <div class="flex-grow w-0 h-full p-4 bg-white shadow-md" ref="loadingRef">
    <ToolBar />

    <!-- 列表start -->
    <transition-group
      tag="div"
      name="quota-list"
      class="relative pt-4 overflow-x-scroll rounded-md list-box"
      ref="quotaBox"
    >
      <!-- 一个卡片 -->
      <div
        @click="handleSelected(item)"
        class="flex items-center mb-1 magictime spaceInDown sortable quota-list-item"
        v-for="(item, index) in selectedQuota"
        :key="item.id"
        :data-quotaId="item.id"
      >
        <div
          :class="[
            item.selected ? 'bg-primary' : 'bg-gray-500',
            'list-theme flex-grow justify-between items-center py-2 text-xs rounded-sm flex',
          ]"
        >
          <span class="flex items-center gap-1">
            <Icon
              icon="akar-icons:drag-horizontal"
              color="#5eead4"
              class="cursor-move drag-handler"
            />
            <span
              class="text-white cursor-pointer select-none"
              @click.stop
              @dblclick="copy(item.id.toString(), 'id')"
              >{{ item.id }}</span
            >
          </span>

          <span class="text-center text-gray-200 w-3em">{{ index + 1 }}</span>
          <span class="flex flex-col">
            <!-- 全称 -->

            <span class="text-lg text-white truncate w-50 min-w-50">
              <Tooltip destroyTooltipOnHide>
                <template #title>{{ item.name }}</template>
                <span class="w-fit" @click.stop @dblclick="copy(item.name, 'name')">{{
                  item.name
                }}</span>
              </Tooltip>
            </span>
            <!-- sourceCode -->
            <span
              class="w-40 max-w-full overflow-x-hidden text-xs text-gray-300 truncate overflow-ellipsis min-w-30"
            >
              <Tooltip>
                <template #title>{{ item.sourceCode }}</template>
                <span class="w-fit" @click.stop @dblclick="copy(item.sourceCode, 'sourceCode')">{{
                  item.sourceCode
                }}</span>
              </Tooltip>
            </span>
          </span>

          <!-- 单位和来源 -->
          <span class="flex justify-between text-white">
            <span class="w-20 text-center" @click.stop>{{ item.unit ?? '暂无单位' }}</span>
          </span>
          <span class="flex flex-col">
            <span class="text-xs text-gray-300 whitespace-nowrap">来自于</span>
            <span class="text-gray-100 w-fit whitespace-nowrap" @click.stop>
              {{ typeFomatter(item.sourceType) }}
            </span>
          </span>
          <span class="flex flex-col">
            <span class="text-xs text-gray-300">更新于</span>
            <span class="text-gray-100 min-w-34 w-34">{{ item.timeLastUpdate ?? '暂未更新' }}</span>
          </span>
          <span class="flex flex-col">
            <span class="text-xs text-gray-300">最新数据</span>
            <span class="text-gray-100 whitespace-nowrap min-w-26 w-26" @click.stop>{{
              `${dateFomatter(item)} ${item.frequency ? `${item.frequency}更` : ''}`
            }}</span>
          </span>
          <span class="flex justify-between text-primary-100 children:w-fit">
            <Tooltip destroyTooltipOnHide>
              <template #title>
                <span class="text-xs">{{ t('quotaView.management.edit') }}</span>
              </template>
              <Icon
                @click.stop="handleIcon(item, 'edit')"
                class="mr-2 cursor-pointer"
                icon="ant-design:edit-outlined"
              />
            </Tooltip>
            <Tooltip destroyTooltipOnHide>
              <template #title>
                <span class="text-xs">{{ t('quotaView.management.update') }}</span>
              </template>
              <Icon
                @click.stop="handleIcon(item, 'update')"
                class="mr-2 cursor-pointer"
                icon="ant-design:sync-outlined"
              />
            </Tooltip>
            <Tooltip destroyTooltipOnHide>
              <template #title>
                <span class="text-xs">{{ t('quotaView.management.clearData.btn') }}</span>
              </template>
              <Icon
                @click.stop="handleIcon(item, 'clearData')"
                class="mr-2 cursor-pointer"
                icon="ant-design:clear-outlined"
              />
            </Tooltip>
            <Tooltip destroyTooltipOnHide>
              <template #title>
                <span class="text-xs">{{ t('quotaView.management.delete') }}</span>
              </template>
              <Icon
                @click.stop="handleIcon(item, 'del')"
                class="!text-red-400 cursor-pointer"
                icon="ant-design:delete-outlined"
              />
            </Tooltip>
          </span>
        </div>
        <div
          :class="[
            item.selected ? 'bg-primary' : 'bg-gray-500',
            'px-1 ml-1 flex items-center rounded-sm',
          ]"
          :style="{ height: itemHeight }"
        >
          <Tooltip destroyTooltipOnHide>
            <template #title>
              <span class="text-xs">{{ t('quotaView.management.remove') }}</span>
            </template>
            <Icon
              @click="handleIcon(item, 'remove')"
              class="cursor-pointer !text-2xl !text-gray-300"
              icon="ant-design:stop-outlined"
            />
          </Tooltip>
        </div>
      </div>
    </transition-group>
    <ClearModal @register="clearModal" />
    <QuotaEditor @register="registerQuotaEditor" />
  </div>
</template>

<script lang="ts" setup>
  import { nextTick, ref, unref, watch, computed, h } from 'vue';
  import type { QuotaItem } from '/#/quota';
  import { Tooltip, Modal, Input } from 'ant-design-vue';
  import { typeFomatter } from '@dq-next/utils/helper/commonHelper';
  import { remove, cloneDeep } from 'lodash-es';
  import { useLoading } from '/@/components/Loading';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { emitter } from '/@/components/QuotaTree/hooks';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useQuotaListContext, useSelectedQuotaContext } from '../hooks';
  import type { SelectedQuotaItem } from '../hooks';
  import ClearModal from './ClearModal.vue';
  import ToolBar from './ToolBar.vue';
  import QuotaEditor from '/@/components/QuotaEditor/src/QuotaEditor.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { formatToDate } from '@dq-next/utils/dateUtil';
  import { delQuota, getQuotaInfo, requestUpdateQuotaData } from '@dq-next/http-apis/quota';
  import { useModal } from '/@/components/Modal';

  // 所有从树中选中的指标
  const selectedQuota = useSelectedQuotaContext();
  // 勾选的指标
  const quotaList = useQuotaListContext();
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [clearModal, { openModal: openClearModal, setModalProps: setClearModalProps }] = useModal();
  const [registerQuotaEditor, { openModal: openQuotaEditor, setModalProps: setQuotaEditorProps }] =
    useModal();
  const loadingRef = ref();

  function handleSelected(item: SelectedQuotaItem) {
    item.selected = !item.selected;
  }
  const loading = ref(false);
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
  // 监听数组，新加入的指标默认被选中
  watch(
    selectedQuota,
    (cur) => {
      quotaList.value = cur.filter((item) => item.selected);
      console.log(document.getElementsByClassName('list-theme')[0]);
      nextTick(() => {
        itemHeight.value = document.getElementsByClassName('list-theme')[0]?.clientHeight + 'px';
      });
    },
    {
      deep: true,
    },
  );
  const itemHeight = ref('');
  function dateFomatter(quota: QuotaItem) {
    if (quota.dateLast === null) return t('common.noData');
    return formatToDate(quota.dateLast);
  }

  function handleIcon(item: QuotaItem, type: string) {
    const handler = {
      remove: () => {
        remove(selectedQuota.value, (quota) => quota.id === item.id);
      },
      edit: () => {
        setQuotaEditorProps({
          afterClose: async () => {
            updateQuotaInfo(item);
            // emitter.emit('updateTree');
          },
        });
        openQuotaEditor(true, item);
      },
      del: () => {
        const targetID = ref('');
        const disabled = computed(() => {
          return targetID.value !== item.id.toString();
        });
        Modal.confirm({
          title: t('quotaView.management.deleteConfirmTip'),
          content: h(
            'div',
            {
              className: 'flex items-center flex-col',
            },
            [
              h('span', {}, t('quotaView.management.deleteInputId')),
              h(Input, {
                onInput: (e) => {
                  targetID.value = e.target.value;
                },
              }),
            ],
          ),
          okType: 'danger',
          okText: t('quotaView.management.confirmDel'),
          okButtonProps: {
            disabled: disabled,
          },
          onOk: async () => {
            try {
              delQuota({ indexId: item.id });
              createMessage.success(t('sys.api.delOK'));
              remove(selectedQuota.value, (q) => q.id === item.id);
              emitter.emit('updateTree');
            } catch (error) {
              createMessage.error(error);
            }
          },
        });
      },
      update: async () => {
        openLoading();
        const { msg } = await requestUpdateQuotaData({
          categoryId: item.categoryId,
          indexIdList: [item.id],
        });
        createMessage.success(msg);
        closeLoading();
        updateQuotaInfo(item);
      },
      clearData: (_) => {
        openClearModal(true, cloneDeep([item]));
        setClearModalProps({
          afterClose: () => {
            updateQuotaInfo(item);
          },
        });
      },
    };
    handler[type]();
  }
  function copy(text: string, type) {
    const textType = {
      name: t('quotaView.quotaCard.name'),
      id: t('quotaView.quotaCard.id'),
      sourceCode: t('quotaView.quotaCard.sourceCode'),
      shortName: t('quotaView.quotaCard.shortName'),
    };
    const { isSuccessRef } = useCopyToClipboard(text);
    unref(isSuccessRef) && createMessage.success(`${textType[type]}已复制到剪贴板`);
  }
  const quotaBox = ref<ComponentRef>();
  const [openLoading, closeLoading] = useLoading({
    props: {
      tip: '处理中...',
      absolute: true,
    },
    target: loadingRef,
  });
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
