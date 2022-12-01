<template>
  <Popover placement="bottom" trigger="click" @visibleChange="updateConfig('baseSize', $event)">
    <Button size="small">{{ t('templateView.toolbar.baseSize') }}</Button>
    <template #content>
      <div class="flex items-center gap-1">
        <Icon icon="ant-design:column-width-outlined" />
        <Input size="small" v-model:value="pageConfig.baseSize.width" class="!w-16 text-center" />
        <Icon icon="ant-design:column-height-outlined" />
        <Input size="small" v-model:value="pageConfig.baseSize.height" class="!w-16 text-center" />
        <BasicHelp :text="t('templateView.toolbar.baseSizeTip')" />
      </div>
    </template>
  </Popover>
  <Popover placement="bottom" trigger="click" @visibleChange="updateConfig('date', $event)">
    <Button size="small">{{ t('templateView.toolbar.sameTimeRange') }}</Button>
    <template #content>
      <RangePicker
        size="small"
        class="w-200px"
        value-format="YYYY-MM-DD"
        v-model:value="pageConfig.date"
      />
    </template>
  </Popover>
  <Popover placement="bottom" trigger="click" @visibleChange="updateConfig('showLastest', $event)">
    <Button size="small">{{ t('templateView.toolbar.showLastest.btn') }}</Button>
    <template #content>
      <Switch
        :checked-children="t('templateView.toolbar.showLastest.t')"
        :un-checked-children="t('templateView.toolbar.showLastest.f')"
        v-model:checked="pageConfig.showLastest"
      />
    </template>
  </Popover>
  <Popover disabled placement="bottom" trigger="click">
    <Button disabled size="small">{{ t('templateView.toolbar.colorsId.btn') }}</Button>
    <template #content>
      <ColorSchemeSelector @change="changeColorScheme" />
      <Button
        class="mt-2"
        size="small"
        type="primary"
        block
        @click="updateConfig('changeColorScheme', false)"
        >{{ t('common.okText') }}</Button
      >
    </template>
  </Popover>
  <Button size="small" @click="dispatch('remove')">
    {{ t('templateView.toolbar.removeNode.btn') }}
  </Button>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Popover, Button, Input, Switch, DatePicker } from 'ant-design-vue';
  import ColorSchemeSelector from './ColorSchemeSelector.vue';
  import { formatToDate, yearsAgo } from '@dq-next/utils/dateUtil';
  import { useSelectTemplateListContext, useTemplateListContext } from '../../hooks';
  import type { chartConfigType } from '/#/chart';
  import { Icon } from '@dq-next/icon';
  import { BasicHelp } from '/@/components/Basic';
  import { remove } from 'lodash-es';

  const RangePicker = DatePicker.RangePicker;
  const { t } = useI18n();

  const pageConfig = reactive({
    date: [yearsAgo(5), formatToDate()],
    sameTimeRange: false,
    showLastest: false,
    baseSize: {
      width: 10,
      height: 6,
    },
    colorsId: 0,
  });

  // 已选中的节点
  const selectedTemplateList = useSelectTemplateListContext();
  // 所有节点
  const templateList = useTemplateListContext();
  async function updateConfig(configName: string, visible: boolean) {
    console.log(configName, visible);

    if (visible) return;
    const param = pageConfig[configName];
    switch (configName) {
      // 修改选中节点的尺寸
      case 'baseSize':
        let { width, height } = param;
        if (/\%/i.test(width)) {
          width = width;
        } else if (parseInt(width).toString() === width) {
          width = `${width}px`;
        } else {
          width = '33.3%';
        }
        if (parseInt(height).toString() === height) {
          height = `${height}px`;
        } else {
          height = '300px';
        }
        selectedTemplateList.value.forEach((temp) => {
          temp.pageConfig.width = width;
          temp.pageConfig.height = height;
        });
        break;
      // 修改选中节点的日期
      case 'date':
        selectedTemplateList.value.forEach((temp) => {
          if (temp.version! < 3) {
            [
              (temp.config as chartConfigType).timeConfig.startDate,
              (temp.config as chartConfigType).timeConfig.endDate,
            ] = [...param];
          }
        });
        break;
      // 修改选中节点是否展示最新值
      case 'showLastest':
        selectedTemplateList.value.forEach((temp) => {
          if (temp.version! < 3) {
            (temp.config as chartConfigType).showLastest = param;
          }
        });
        break;
      case 'changeColorScheme':
        console.log('qqqqq');

        for (let i = 0; i < selectedTemplateList.value.length; i++) {
          const temp = selectedTemplateList.value[i];
          console.log(temp);
        }
        break;
      default:
        break;
    }
  }
  async function dispatch(eventName: string) {
    switch (eventName) {
      case 'remove':
        remove(templateList.value, (t) => {
          // if (t.type === 'Img') {
          //   remove(imgList.value, (url) => url === t.config.url);
          // }
          return selectedTemplateList.value.some((temp) => t.uniqId === temp.uniqId);
        });
        break;
      default:
        break;
    }
  }
  function changeColorScheme() {
    // selectedTemplateList.value.f;
  }
</script>

<style lang="less" scoped></style>
