<template>
  <div>
    <Drawer
      :mask="false"
      :closable="false"
      :headerStyle="{ display: 'none' }"
      :style="{
        position: 'absolute',
        width: visible ? props.width : '1rem',
      }"
      :class="`${prefixCls}-main`"
      @afterVisibleChange="afterVisibleChange"
      v-bind="$attrs"
      v-model:visible="visible"
    >
      <slot></slot>
      <div
        ref="drawerBar"
        class="line-bar"
        :style="{ [$attrs.placement === 'left' ? 'right' : 'left']: 0 }"
        @click="toggleVisible"
      >
        <Icon
          :icon="
            visible
              ? $attrs.placement === 'left'
                ? 'ant-design:left-outlined'
                : 'ant-design:right-outlined'
              : $attrs.placement === 'left'
              ? 'ant-design:right-outlined'
              : 'ant-design:left-outlined'
          "
        />
      </div>
    </Drawer>
    <div
      v-if="props.inside"
      :class="`${prefixCls}-shadow`"
      :style="{
        width: visible ? props.width : '1rem',
      }"
    ></div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { propTypes } from '@dq-next/utils/propTypes';

  export default defineComponent({
    inheritAttrs: false,
  });
</script>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Drawer } from 'ant-design-vue';
  import { Icon } from '@dq-next/icon';
  import { useDesign } from '/@/hooks/web/useDesign';

  const props = defineProps({
    inside: propTypes.bool.def(false),
    width: propTypes.string.def('300px'),
  });

  const visible = ref(true);

  const drawerBar = ref<ElRef>();

  const { prefixCls } = useDesign('bar-drawer');

  async function toggleVisible() {
    visible.value = !visible.value;
  }
  function afterVisibleChange(visible: boolean) {
    if (visible) {
    } else {
      (drawerBar.value?.closest('.ant-drawer-content-wrapper') as HTMLDivElement).style.transform =
        'translateX(0)';
    }
  }
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-bar-drawer';

  .@{prefix-cls}-main {
    .line-bar {
      position: absolute;
      top: 0;
      width: 1rem;
      height: 100%;
      display: flex;
      align-items: center;

      &:hover {
        @apply bg-gray-100;
      }
    }

    &.ant-drawer {
      transition: width 0.3s @ease-out-back;

      & .ant-drawer-content {
        overflow: hidden;
      }
    }

  }

  .@{prefix-cls}-shadow{
      transition: width 0.3s @ease-out-back;
      height: 100%;
  }
</style>
