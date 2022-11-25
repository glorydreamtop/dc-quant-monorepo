<template>
  <section class="full-loading" :class="{ absolute }" v-show="loadingRef" ref="loadingEl">
    <!-- <Spin v-bind="$attrs" :tip="tip" :size="size" :spinning="loadingRef" /> -->
    <div class="container"></div>
  </section>
</template>
<script lang="ts">
  import { onMounted, PropType, ref, toRefs, watch } from 'vue';
  import { defineComponent } from 'vue';
  import { SizeEnum } from '/@/enums/sizeEnum';
  import { useLottie } from '/@/hooks/web/useCool';

  export default defineComponent({
    name: 'Loading',
    props: {
      tip: {
        type: String as PropType<string>,
        default: '',
      },
      size: {
        type: String as PropType<SizeEnum>,
        default: SizeEnum.LARGE,
        validator: (v: SizeEnum): boolean => {
          return [SizeEnum.DEFAULT, SizeEnum.SMALL, SizeEnum.LARGE].includes(v);
        },
      },
      absolute: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
      loading: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
      background: {
        type: String as PropType<string>,
      },
      theme: {
        type: String as PropType<'dark' | 'light'>,
      },
    },
    setup(props) {
      const loadingEl = ref<HTMLElement>();
      const loadingRef = ref(false);
      const { loading } = toRefs(props);
      let anim;
      onMounted(() => {
        anim = useLottie({
          container: loadingEl.value!.getElementsByClassName('container')[0],
          loop: true,
          render: 'canvas',
          autoplay: false,
          path: 'https://assets4.lottiefiles.com/packages/lf20_OdNgAj.json',
        });
      });
      watch(loading, (v) => {
        if (v) {
          anim.play();
          loadingEl.value!.style.opacity = '1';
          loadingRef.value = v;
        } else {
          loadingEl.value!.style.opacity = '0';
          setTimeout(() => {
            loadingRef.value = false;
            anim.stop();
          }, 200);
        }
      });
      return {
        loadingEl,
        loadingRef,
      };
    },
  });
</script>
<style lang="less" scoped>
  .full-loading {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    background-color: rgb(240 242 245 / 40%);
    opacity: 100%;
    transition: opacity 300ms ease;

    &.absolute {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 300;
    }
  }

  html[data-theme='dark'] {
    .full-loading:not(.light) {
      background-color: @modal-mask-bg;
    }
  }

  .full-loading.dark {
    background-color: @modal-mask-bg;
  }

  .container {
    width: 30%;
    height: auto;
    max-width: 200px;
    max-height: 200px;
    min-width: 100px;
    min-height: 100px;

    ::v-deep(image) {
      transform: scale(2);
      transform-origin: center;
    }
  }
</style>
