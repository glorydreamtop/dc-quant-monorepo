<template>
  <div class="h-full">
    <div ref="chartRef" class="h-full"></div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, toRefs, watch } from 'vue';
  import { RankResult } from '@dq-next/http-apis/future/model';
  import { useECharts } from '/@/hooks/web/useECharts';

  const props = defineProps<{
    dataList: RankResult;
    title: string;
    size: number;
  }>();
  const { dataList, title, size } = toRefs(props);
  const chartRef = ref();
  const chartData = computed(() => dataList.value.slice(0, size.value));
  const { setOptions } = useECharts(chartRef);
  setOptions({
    title: {
      text: title.value,
      left: 'center',
    },
  });
  watch(
    dataList,
    (v) => {
      if (v.length > 0) {
        setOptions({
          color: ['#31868f', '#ffdb3f'],
          title: {
            text: title.value,
            left: 'center',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              crossStyle: {
                color: '#999',
              },
            },
          },
          legend: {
            top: 'bottom',
            data: ['持买仓量', '增减量'],
          },
          xAxis: {
            type: 'category',
            data: chartData.value.map((item) => item.memberName),
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              name: '持买仓量',
              type: 'bar',
              data: chartData.value.map((item: any) => {
                return item.volume;
              }),
            },
            {
              name: '增减量',
              type: 'bar',
              data: chartData.value.map((item: any) => {
                return item.volumeChange;
              }),
            },
          ],
        });
      }
    },
    {
      deep: true,
    },
  );
</script>

<style lang="less" scoped></style>
