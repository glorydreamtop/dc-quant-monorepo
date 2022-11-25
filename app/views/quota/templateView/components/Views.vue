<template>
  <div class="mr-2 relative view-box overflow-hidden">
    <Ruler :left="gridAreaStyle.left" :top="gridAreaStyle.top" />
    <Scale />
    <div class="mt-8 pages-box">
      <PagePlaceHolder :pagination-info="paginationInfo" />
      <PageLayout :grid-area-style="gridAreaStyle" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, computed, ComputedRef, CSSProperties } from 'vue';
  import { usePageSettingContext, paginationInfoType } from '../hooks';
  import PagePlaceHolder from './PagePlaceHolder.vue';

  import Ruler from './views/Ruler.vue';
  import Scale from './views/Scale.vue';
  import PageLayout from './views/PageLayout.vue';

  // 页面设置
  const pageSetting = usePageSettingContext();
  const gridAreaStyle: ComputedRef<CSSProperties> = computed(() => {
    return {
      top: `calc((${pageSetting.paddingTop}px + 1.5rem) * ${pageSetting.scale / 100})`,
      left: `calc((100% - ${
        pageSetting.paddingLeft + pageSetting.paddingRight + 8 + 1200
      }px) / 2 + ${pageSetting.paddingLeft}px)`,
      minHeight: `900px`,
    };
  });

  const paginationInfo: paginationInfoType = reactive({
    totalPage: 1,
  });
</script>

<style lang="less" scoped>
  .view-box {
    width: calc(100% - 8px);
    height: calc(100% - 6rem);
  }

  .pages-box {
    width: 100%;
    height: calc(100% - 2rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    overflow-y: scroll;
  }
</style>
