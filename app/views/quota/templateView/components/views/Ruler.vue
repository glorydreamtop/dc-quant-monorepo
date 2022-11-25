<template>
  <!-- 4px是减去半个滚动条 -->
  <div class="ruler-top" :style="{ left: `calc(${left} - 4px)` }">
    <div class="text-container">
      <span class="text" v-for="i in 31" :key="i">{{ i - 1 }}</span>
    </div>
  </div>
  <div
    class="ruler-left"
    :style="{ top: `calc(${top} + 2rem)`, left: `calc(${left} - 2.9rem)` }"
  ></div>
</template>

<script lang="ts" setup>
  import { computed, CSSProperties } from 'vue';
  import { usePageSettingContext } from '../../hooks';

  defineProps<{
    left: CSSProperties['left'];
    top: CSSProperties['top'];
  }>();

  const pageSetting = usePageSettingContext();

  const style = computed(() => {
    const scale = pageSetting.scale / 100;
    const { paddingLeft, paddingRight } = pageSetting;
    const width = paddingLeft + paddingRight + 1200;
    return { scaleX: scale, translateX: `${(width * (1 - scale)) / 2}px` };
  });
</script>

<style lang="less" scoped>
  @line-color: #f2f2f2;
  @grid-size: 40px;
  @ruler-color: darken(@line-color, 30%);

  .ruler-top {
    top: 1.4rem;
    width: 1200px;
    height: 6px;
    border-left: 1px solid @ruler-color;
    border-right: 1px solid @ruler-color;
    background-image: -webkit-linear-gradient(left, transparent @grid-size - 1, @ruler-color 0),
      -webkit-linear-gradient(top, transparent 5px, @ruler-color 0);
    background-size: @grid-size;
    transform: scaleX(v-bind('style.scaleX')) translateX(-1px);
  }

  .ruler-left {
    width: 6px;
    height: 100%;
    // border-top: 1px solid @ruler-color;
    // border-bottom: 1px solid @ruler-color;
    background-image: -webkit-linear-gradient(top, transparent @grid-size - 1, @ruler-color 0),
      -webkit-linear-gradient(left, transparent 5px, @ruler-color 0);
    background-size: @grid-size @grid-size;
    transform: translateX(v-bind('style.translateX'));
  }

  .ruler-left,
  .ruler-top {
    position: absolute;
    z-index: 9;
    transition: transform 0.2s;

    .text-container {
      width: calc(100% + 1em);
      display: flex;
      justify-content: space-between;
      transform: translate(-0.55em, -1em);
      line-height: 1em;
      text-align: center;
      color: @ruler-color;
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }

    .text {
      width: 1em;
    }
  }
</style>
