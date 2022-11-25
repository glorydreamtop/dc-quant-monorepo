<template>
  <BarDrawer
    width="340px"
    :style="{
      top: '8rem',
      height: '420px',
      right: '2rem',
    }"
    v-bind="$attrs"
  >
    <Advance v-if="temp.type === 'Chart'">
      <template #actions>
        <Button type="primary" block>
          <span>应用</span>
          <BasicHelp color="#FFFFFF" text="仅在报告中生效" />
        </Button>
        <Button block>
          <span>覆盖保存</span>
          <BasicHelp text="修改对应的图表模板" />
        </Button>
      </template>
    </Advance>
  </BarDrawer>
</template>

<script lang="ts" setup>
  import Advance from '../../../quotaView/components/Advance.vue';
  import { BarDrawer } from '/@/components/Drawer';
  import { Button } from 'ant-design-vue';
  import { TemplateDOM } from '/#/template';
  import { onMounted, reactive, watchEffect } from 'vue';
  import { createChartConfigContext } from '../../../quotaView/components/hooks';
  import { mergeAndRemove } from '@dq-next/utils/helper/commonHelper';
  import { chartConfigType } from '/#/chart';
  import { BasicHelp } from '/@/components/Basic';
  import { pageEventBus } from '../../hooks';

  const temp = reactive({} as TemplateDOM);
  const config = reactive({}) as chartConfigType;
  createChartConfigContext<chartConfigType>(config);
  watchEffect(() => {
    mergeAndRemove(config, temp.config);
  });

  onMounted(() => {
    pageEventBus.on('editTemp', (_temp: TemplateDOM) => {
      Object.assign(temp, _temp);
    });
  });
</script>

<style lang="less" scoped></style>
