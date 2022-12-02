<template>
  <div :class="['toolbar', $attrs.class]">
    <Tooltip
      :title="
        state.showTable
          ? t('quotaView.doubleSideChart.downloadXLSX')
          : t('quotaView.doubleSideChart.downloadImg')
      "
    >
      <Icon
        v-if="setting.download"
        :class="['download-icon animate__animated', state.renderSuccess ? 'disabled' : '']"
        size="22"
        icon="xiazai|svg"
        @click="download"
      />
    </Tooltip>
    <Tooltip
      :title="
        state.showTable
          ? t('quotaView.doubleSideChart.chartView')
          : t('quotaView.doubleSideChart.tableView')
      "
    >
      <div
        v-if="setting.side"
        :class="[state.renderSuccess ? 'disabled' : '', 'relative show-table-chart']"
        @click="handleEvent(state.showTable ? 'showChart' : 'showTable')"
      >
        <Icon
          :class="['chartmode-icon', state.showTable ? 'front' : 'back']"
          icon="fsux_tubiao_zhuzhuangtu|svg"
          size="24"
        />
        <Icon
          :class="['sheetmode-icon -mt-1px', !state.showTable ? 'front' : 'back']"
          icon="fsux_tubiao_biaoge|svg"
          size="24"
        />
      </div>
    </Tooltip>
    <Icon
      v-if="setting.fullscreen"
      icon="quanping|svg"
      size="24"
      @click="handleEvent('fullscreen')"
    />
    <Tooltip
      :title="
        state.paintMode
          ? t('quotaView.doubleSideChart.paintModeOff')
          : t('quotaView.doubleSideChart.paintModeOn')
      "
    >
      <Icon
        v-if="setting.mark"
        icon="fabiao|svg"
        size="22"
        :class="['filter paint-mode-icon', state.paintMode ? '' : 'grayscale-75']"
        @click="handleEvent('paintMode')"
      />
    </Tooltip>
  </div>
  <div class="esc" v-if="state.isFullScreen" @click="handleEvent('fullscreen')">
    <div class="text-white keybord">{{ t('quotaView.doubleSideChart.fullscreen') }}</div>
    <Icon icon="ant-design:close-circle-outlined" class="!text-gray-600 !text-3xl" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onUnmounted, watchEffect } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMagicKeys, useTimeoutFn } from '@vueuse/core';
  import { chartSetting } from '../../chart';
  import Icon from '@dq-next/icon';

  const props = defineProps<{
    setting?: Partial<chartSetting>;
    state: {
      paintMode: boolean;
      showTable: boolean;
      loadTable: boolean;
      isFullScreen: boolean;
      renderSuccess: boolean;
    };
  }>();

  const emits = defineEmits<{
    (event: 'update:state', state: Partial<typeof props.state>);
    (event: 'screenShot');
    (event: 'downloadxlsx');
  }>();

  function updateState(state: Partial<typeof props.state>) {
    emits('update:state', state);
  }

  const setting = computed(() => {
    const def: chartSetting = {
      download: true,
      side: true,
      fullscreen: true,
      mark: true,
    };
    Object.assign(def, props.setting);
    return def;
  });

  const { t } = useI18n();

  onUnmounted(() => {
    stop();
  });
  const { Escape } = useMagicKeys();
  const stop = watchEffect(() => {
    // ESC键关闭全屏
    if (Escape.value) updateState({ isFullScreen: false });
  });

  // 响应工具栏事件
  async function handleEvent(type: string) {
    if (props.state.paintMode && type !== 'paintMode') return;
    switch (type) {
      case 'screenshot':
        emits('screenShot');
        break;
      case 'xlsx':
        emits('downloadxlsx');
        break;
      case 'showTable':
        if (!props.state.loadTable) {
          updateState({ loadTable: true });
          await nextTick();
        }
        updateState({ showTable: true });
        break;
      case 'showChart':
        updateState({ showTable: false });
        break;
      case 'fullscreen':
        updateState({ isFullScreen: !props.state.isFullScreen });
        break;
      case 'paintMode':
        updateState({ paintMode: !props.state.paintMode });
        break;
      default:
        break;
    }
  }
  async function download({ target }: { target: HTMLElement }) {
    target.parentElement!.parentElement!.classList.add('animate__bounce');
    useTimeoutFn(() => {
      target.parentElement!.parentElement!.classList.remove('animate__bounce');
      handleEvent(props.state.showTable ? 'xlsx' : 'screenshot');
    }, 1000);
  }
</script>

<style lang="less" scoped>
  .toolbar {
    display: flex;
    align-items: center;
    position: absolute;
    z-index: 19;
    margin-left: 2rem;
    height: 1rem;
    width: fit-content;

    .disabled {
      pointer-events: none;
      transition: none;
    }

    .show-table-chart {
      width: 24px;
      height: 24px;
    }

    .chartmode-icon,
    .sheetmode-icon {
      position: absolute;
      backface-visibility: hidden;
      transition: all 0.2s;
      perspective: 1000;

      &.front {
        transform: rotateY(-180deg);
      }

      &.back {
        transform: rotateY(-360deg);
      }
    }
  }

  .esc {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 1rem;
    top: 0.5rem;
    right: 1rem;
    z-index: 10;
    cursor: pointer;
  }

  .keybord {
    box-shadow: inset 0 -4px 0 darken(@primary-color, 10%);
    background-color: @primary-color;
    line-height: 1.2;
    border-radius: 6px;
    padding: 6px 10px 8px 10px;
  }
</style>
