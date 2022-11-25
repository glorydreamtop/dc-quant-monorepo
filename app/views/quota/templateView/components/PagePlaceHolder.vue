<template>
  <!-- 这个8px是滚动条宽度 -->
  <div
    id="pagePlaceHolder"
    :style="{
      width: `${pageSetting.paddingLeft + pageSetting.paddingRight + 8 + 1200}px`,
    }"
  >
    <div
      :class="[
        'pages bg-white shadow-lg shadow-gray-300 flex flex-col',
        pageSetting.pagination ? 'mb-23px' : '',
      ]"
      v-for="pageIdx in paginationInfo.totalPage"
      :key="pageIdx"
      :data-pageid="pageIdx"
      :style="pageStyle"
    >
      <!-- 页眉start -->
      <div class="border-b page-header" v-show="pageSetting.header.show">
        <span contenteditable @input="pageHeaderChange('left', $event)">{{
          pageSetting.header.left
        }}</span>
        <span class="flex gap-1 page-header-right"
          ><img class="w-3.5 h-3.5" src="https://www.shducheng.net/favicon.ico" /><span
            contenteditable
            @input="pageHeaderChange('right', $event)"
            class="text-right"
            >{{ pageSetting.header.right }}</span
          ></span
        >
      </div>
      <!-- 页眉end -->
      <div class="page-main w-1200px flex-grow"> </div>
      <!-- 页脚start -->
      <div class="border-t page-footer">
        <span
          contenteditable
          v-show="pageSetting.footer.show"
          @input="pageFooterChange('left', $event)"
          >{{ pageSetting.footer.left }}</span
        >
        <span class="footer-page-num" v-show="pageSetting.footer.pageNum">{{ pageIdx }}</span>
        <span v-show="pageSetting.footer.show" class="flex gap-1 page-footer-right"
          ><img class="w-3.5 h-3.5 ico" src="https://www.shducheng.net/favicon.ico" /><span
            contenteditable
            @input="pageFooterChange('right', $event)"
            >{{ pageSetting.footer.right }}</span
          ></span
        >
      </div>
      <!-- 页脚end -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { toRefs, ComputedRef, computed, CSSProperties } from 'vue';
  import { paginationInfoType, usePageSettingContext } from '../hooks';

  const props = defineProps<{
    paginationInfo: paginationInfoType;
  }>();

  const { paginationInfo } = toRefs(props);

  // 页面设置
  const pageSetting = usePageSettingContext();

  const pageStyle: ComputedRef<CSSProperties> = computed(() => {
    return {
      paddingTop: `${pageSetting.paddingTop}px`,
      paddingBottom: `${pageSetting.paddingBottom}px`,
      paddingLeft: `${pageSetting.paddingLeft}px`,
      paddingRight: `${pageSetting.paddingRight}px`,
      aspectRatio: pageSetting.pagination
        ? pageSetting.horizontal
          ? '297/210'
          : '210/297'
        : 'unset',
    };
  });

  function pageHeaderChange(pos: 'left' | 'right', e: InputEvent) {
    pageSetting.header[pos] = (e.target as HTMLSpanElement).innerText;
  }
  function pageFooterChange(pos: 'left' | 'right', e: InputEvent) {
    pageSetting.footer[pos] = (e.target as HTMLSpanElement).innerText;
  }
</script>

<style lang="less" scoped>
  .pages {
    // width: 100%;
    height: auto;
    min-height: 1200px;
  }

  #pagePlaceHolder {
    transform-origin: 50% 0;
    transform: scale(v-bind('pageSetting.scale/100'));
    transition: transform 0.2s;
  }

  .page-header,
  .page-footer {
    @apply border-gray-200;
    @apply text-sm;
    @apply leading-6;
    @apply px-1;
    @apply text-gray-300;

    position: relative;
    width: 100%;
    height: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      width: fit-content;
      // font-style: italic;
      outline: none;
      overflow: visible;
    }
  }

  .page-header-right,
  .page-footer-right {
    display: inline-flex;
    align-items: center;
  }

  .footer-page-num {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  @line-color: #f2f2f2;
  @grid-size: 40px;
  @ruler-color: darken(@line-color, 30%);

  .page-main {
    background-image: -webkit-linear-gradient(top, transparent @grid-size - 1, @line-color 0),
      -webkit-linear-gradient(left, transparent @grid-size - 1, @line-color 0);
    background-size: @grid-size @grid-size;
    background-repeat: repeat;
  }
</style>
