import type { EChartsOption } from 'echarts';
import type { Ref } from 'vue';
import { tryOnUnmounted, useTimeoutFn } from '@vueuse/core';
import { unref, nextTick, computed, ref } from 'vue';
// import { useDebounceFn } from '@vueuse/core';
// import { useBreakpoint } from '/@/hooks/event/useBreakpoint';
import echarts from '@dq-next/utils/lib/echarts';

export function useECharts(elRef: Ref<HTMLDivElement | HTMLCanvasElement>) {
  let chartInstance: echarts.EChartsType | null = null;
  // let resizeFn: Fn = resize;
  const cacheOptions = ref({}) as Ref<EChartsOption>;

  // resizeFn = useDebounceFn(resize, 200);

  const getOptions = computed(() => {
    return {
      backgroundColor: 'transparent',
      ...cacheOptions.value,
    } as EChartsOption;
  });

  function initCharts() {
    const el = unref(elRef);
    if (!el || !unref(el)) {
      return;
    }

    chartInstance = echarts.init(el, {
      renderer: 'svg',
    });
    // const { widthRef, screenEnum } = useBreakpoint();
    // if (unref(widthRef) <= screenEnum.MD || el.offsetHeight === 0) {
    //   useTimeoutFn(() => {
    //     resizeFn();
    //   }, 30);
    // }
  }

  function setOptions(options: EChartsOption, clear = true) {
    cacheOptions.value = options;
    console.log(unref(getOptions));

    if (unref(elRef)?.offsetHeight === 0) {
      useTimeoutFn(() => {
        setOptions(unref(getOptions));
      }, 30);
      return;
    }
    nextTick(() => {
      useTimeoutFn(() => {
        if (!chartInstance) {
          initCharts();

          if (!chartInstance) return;
        }
        clear && chartInstance?.clear();

        chartInstance?.setOption(unref(getOptions), true);
      }, 30);
    });
  }

  function resize() {
    chartInstance?.resize({
      animation: {
        duration: 200,
      },
    });
  }

  tryOnUnmounted(() => {
    if (!chartInstance) return;
    chartInstance.dispose();
    chartInstance = null;
  });

  function getInstance(): echarts.ECharts | null {
    if (!chartInstance) {
      initCharts();
    }
    return chartInstance;
  }

  return {
    setOptions,
    resize,
    echarts,
    getInstance,
  };
}
