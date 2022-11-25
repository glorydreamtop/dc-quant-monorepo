<template>
  <Select class="min-w-26" size="small" optionLabelProp="label" v-model:value="colorScheme.id">
    <SelectOption
      v-for="item in colorSchemeList"
      :key="item.id"
      :value="item.id"
      :label="item.label"
    >
      <Popover placement="right">
        <template #content>
          <div class="flex color-popover">
            <div
              v-for="color in item.value"
              :key="color"
              class="w-2 h-4"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </template>
        <div class="w-full">{{ item.label }}</div>
      </Popover>
    </SelectOption>
  </Select>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { Select, Popover } from 'ant-design-vue';
  import { useChartConfigContext } from './hooks';
  import { getAllColorScheme } from '@dq-next/http-apis/color';
  import { cloneDeep } from 'lodash-es';

  interface LabelValueOption {
    label: string;
    value: any;
    id: number;
  }
  const SelectOption = Select.Option;
  const chartConfig = useChartConfigContext();
  const colorScheme = ref({
    id: chartConfig.colorSchemeId,
    label: '',
    value: '',
  });
  const colorSchemeList = ref<LabelValueOption[]>([]);
  async function getColorSchemeList() {
    const { list } = await getAllColorScheme({ currPage: 1, pageSize: 20 });
    colorSchemeList.value = list.map((item) => {
      return {
        label: item.name,
        value: item.colors.split(','),
        id: item.id,
      };
    });
    colorScheme.value = cloneDeep(colorSchemeList.value[0]);
    chartConfig.colorSchemeId = colorSchemeList.value[0].id;
  }
  watch(
    colorScheme,
    (v) => {
      chartConfig.colorSchemeId = v.id;
      // 颜色方案ID不可删除，避免切换图表类型或其他操作时这个字段被意外删除
      Reflect.defineProperty(chartConfig, 'colorSchemeId', {
        configurable: false,
      });
    },
    {
      deep: true,
    },
  );
  getColorSchemeList();
</script>

<style lang="less" scoped>
  .color-popover {
    margin: -6px -8px;
    gap: 2px;

    div {
      // transform: skew(-10deg);
    }
  }
</style>
