<template>
  <div
    :data-quotaId="quotaInfo.id"
    :class="[quotaInfo.selected ? 'card-selected' : 'card-notselected', 'card-theme']"
  >
    <div :class="['quota-id', quotaInfo.selected ? 'quota-id-selected' : 'quota-id-notselected']">
      <Icon icon="akar-icons:drag-horizontal" class="cursor-move drag-handler" />
      <span
        class="w-4em text-center cursor-pointer select-none"
        @click.stop
        @dblclick="copy(quotaInfo.id.toString(), 'id')"
        >{{ isFormula(quotaInfo) ? t('quotaView.quotaCard.formulaWithoutId') : quotaInfo.id }}</span
      >
    </div>

    <!-- 全称 -->
    <Tooltip placement="bottomLeft" :mouseEnterDelay="0.5">
      <template #title>{{ quotaInfo.name }}</template>
      <span class="quota-title"
        ><span class="w-fit" @click.stop @dblclick="copy(quotaInfo.name, 'name')">{{
          quotaInfo.name
        }}</span></span
      >
    </Tooltip>
    <!-- sourceCode -->
    <span class="quota-sourceCode"
      ><span class="w-fit" @click.stop @dblclick="copy(quotaInfo.sourceCode, 'sourceCode')">{{
        quotaInfo.sourceCode
      }}</span></span
    >
    <span class="quota-unit" @click.stop>{{ quotaInfo.unit }}</span>
    <Tooltip :mouseEnterDelay="0.5">
      <template #title>
        <span class="w-fit quota-date">{{
          !isFormula(quotaInfo)
            ? `${t('quotaView.quotaCard.updateOn')}${quotaInfo.timeLastUpdate}`
            : t('quotaView.quotaCard.formulaTip')
        }}</span>
      </template>
      <span class="w-fit quota-date whitespace-nowrap" @click.stop>{{
        `${dateFomatter(quotaInfo)} ${quotaInfo.frequency ? `${quotaInfo.frequency}更` : ''}`
      }}</span>
    </Tooltip>
    <span class="icon-slot" @click.stop @contextmenu.stop>
      <slot name="actions"></slot>
    </span>
    <div :class="['card-footer', slots.footer ? 'divide' : '']" @click.stop @contextmenu.stop>
      <slot name="footer"></slot>
    </div>

    <div class="sourceType" @click.stop>{{ typeFomatter(quotaInfo.sourceType) }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { toRefs, unref, useSlots } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { typeFomatter } from '@dq-next/utils/helper/commonHelper';
  import { QuotaItem } from '/#/quota';
  import { SourceTypeEnum } from '/@/enums/quotaEnum';
  import { formatToDate } from '@dq-next/utils/dateUtil';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Icon } from '/@/components/Icon';
  import { SelectedQuotaItem } from '/@/views/quota/quotaView/components/hooks';

  const props = defineProps<{
    quotaInfo: SelectedQuotaItem;
  }>();
  const { quotaInfo } = toRefs(props);
  const slots = useSlots();

  const { t } = useI18n();
  const { createMessage } = useMessage();

  function isFormula(quota: QuotaItem) {
    return /formula/i.test(quota.id.toString());
  }

  function dateFomatter(quota: QuotaItem) {
    if (isFormula(quota) && quota.sourceType === SourceTypeEnum.formula)
      return t('quotaView.quotaCard.calculate');
    if (quota.dateLast === null) return t('common.noData');
    return formatToDate(quota.dateLast);
  }

  function copy(text: string, type: string) {
    // 临时公式没有ID
    if (type === 'id' && /formula/i.test(text)) return;
    const textType = {
      name: t('quotaView.quotaCard.name'),
      id: t('quotaView.quotaCard.id'),
      sourceCode: t('quotaView.quotaCard.sourceCode'),
      shortName: t('quotaView.quotaCard.shortName'),
    };
    const { isSuccessRef } = useCopyToClipboard(text);
    unref(isSuccessRef) && createMessage.success(`${textType[type]}已复制到剪贴板`);
  }
</script>

<style lang="less" scoped>
  html[data-theme='dark'] {
    .card-theme {
      --tw-bg-opacity: 0.1 !important;

      .quota-title {
        @apply mt-5 cursor-pointer select-none text-xl leading-tight font-bold tracking-1px  text-primary whitespace-nowrap border-b border-primary-200 pb-2px pr-1 w-fit max-w-full overflow-x-hidden;

        grid-row: 1/2;
        grid-column: 1/4;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .quota-sourceCode {
        @apply mt-1 w-fit text-primary-400;

        grid-row: 2/3;
        grid-column: 1/4;
      }

      .quota-unit {
        @apply w-30 text-center w-fit text-primary-400;

        grid-row: 3/4;
        grid-column: 1/3;
        align-self: end;
      }

      .quota-date {
        @apply text-primary-400;

        grid-row: 4/5;
        grid-column: 1/2;
        align-self: end;
      }

      .sourceType {
        @apply absolute bg-primary !text-white pl-1 pr-2 py-2px top-2 -right-2;

        &::after {
          content: '';
          position: absolute;
          bottom: -6px;
          right: 0;
          // 伪类三角形
          border-style: solid;
          border-width: 6px 8px 0 0;
          border-color: #c2c2c2 transparent transparent #c2c2c2;
        }
      }

      .icon-slot {
        grid-row: 4/5;
        grid-column: 3/4;
        justify-self: end;
      }

      .card-footer {
        grid-row: 5/6;
        grid-column: 1/4;
      }

      .divide {
        @apply border-t border-primary-200 mt-1;
      }
    }

    .card-notselected {
      @apply filter grayscale-75;
    }
  }

  .card-theme {
    --tw-bg-opacity: 0.5 !important;
    @apply relative w-52 grid bg-primary-100 border border-primary-100 px-2 py-1 text-xs;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: min-content min-content auto min-content min-content;
    min-height: 7rem;
    transition: filter 0.2s;

    .quota-id {
      @apply flex items-center gap-1 absolute top-0 left-0 py-2px px-1 mb-1 w-fit rounded-br-md text-white;

      &-selected {
        @apply bg-primary;
      }

      &-notselected {
        @apply bg-primary-300;
      }

      .drag-handler {
        @apply !text-white;
      }
    }

    .quota-title {
      @apply mt-5 cursor-pointer select-none text-xl leading-tight font-bold tracking-1px  text-primary whitespace-nowrap border-b border-primary-200 pb-2px pr-1 w-fit max-w-full overflow-x-hidden;

      grid-row: 1/2;
      grid-column: 1/4;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .quota-sourceCode {
      @apply mt-1 w-fit text-primary-400;

      grid-row: 2/3;
      grid-column: 1/4;
    }

    .quota-unit {
      @apply w-30 text-center w-fit text-primary-400;

      grid-row: 3/4;
      grid-column: 1/3;
      align-self: end;
    }

    .quota-date {
      @apply text-primary-400;

      grid-row: 4/5;
      grid-column: 1/2;
      align-self: end;
    }

    .sourceType {
      @apply absolute bg-primary !text-white pl-1 pr-2 py-2px top-2 -right-2;

      &::after {
        content: '';
        position: absolute;
        bottom: -6px;
        right: 0;
        // 伪类三角形
        border-style: solid;
        border-width: 6px 8px 0 0;
        border-color: #c2c2c2 transparent transparent #c2c2c2;
      }
    }

    .icon-slot {
      grid-row: 4/5;
      grid-column: 3/4;
      justify-self: end;
    }

    .card-footer {
      grid-row: 5/6;
      grid-column: 1/4;
    }

    .divide {
      @apply border-t border-primary-200 mt-1;
    }
  }

  .card-selected {
    // @apply bg-primary;
  }

  .card-notselected {
    @apply filter grayscale-75;
  }
</style>
