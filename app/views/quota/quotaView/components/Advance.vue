<template>
  <div class="w-full h-full overflow-x-hidden relative select-none flex flex-col gap-4">
    <Collapse
      class="overflow-x-hidden overflow-y-scroll flex-grow"
      v-model:activeKey="collapseKey"
      :bordered="false"
    >
      <CollapsePanel :key="item.key" v-for="item in collapseList">
        <template #header>
          <Divider orientation="left">{{ item.title }}</Divider>
        </template>
        <Component :is="item.content" :key="item.key" />
      </CollapsePanel>
    </Collapse>
    <div class="flex items-end justify-center gap-1 w-full bg-white">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Divider, Collapse } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { ref, shallowRef } from 'vue';
  import { Model, Axis, DataSource, Formatter, Base } from './advance';

  const CollapsePanel = Collapse.Panel;

  const { t } = useI18n();
  const collapseKey = ref('base');

  const collapseList = shallowRef([
    {
      key: 'base',
      title: t('quotaView.advance.baseSetting.title'),
      content: Base,
    },
    {
      key: 'datasourceSetting',
      title: t('quotaView.advance.datasourceSetting.title'),
      content: DataSource,
    },
    {
      key: 'rectSetting',
      title: t('quotaView.advance.rectSetting.title'),
      content: Model,
    },
    {
      key: 'valueFormatter',
      title: t('quotaView.advance.valueFormatter.title'),
      content: Formatter,
    },
    {
      key: 'axisSetting',
      title: t('quotaView.advance.axisSetting.title'),
      content: Axis,
    },
  ]);
</script>

<style lang="less" scoped>
  @actions-height: 40px;

  ::v-deep(.label) {
    @apply flex items-center gap-2;
  }

  .ant-collapse {
    background-color: transparent !important;

    &-item {
      border: none;
    }
  }

  .ant-divider {
    margin: 0;

    ::v-deep(.ant-divider-horizontal.ant-divider-with-text-left::before) {
      display: none;
    }
  }

  ::v-deep(.anticon.anticon-close) {
    vertical-align: middle;
    color: @primary-color;
    font-size: 12px;
    margin-top: -2px;
    margin-right: -4px;
  }
</style>
