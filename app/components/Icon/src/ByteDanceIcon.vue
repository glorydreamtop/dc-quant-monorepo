<template>
  <IconifyIcon v-bind="{ ...$attrs, ...$props, color }" v-if="!park" />
  <span v-else ref="elRef" :class="$attrs.class"></span>
</template>
<script lang="ts">
  export default defineComponent({
    name: 'Icon',
  });
</script>
<script lang="ts" setup>
  import * as IconMap from '@icon-park/vue-next/es/map';
  import { IconThemeEnum } from '/@/enums/appEnum';
  import { computed, ref, watch, render, createVNode, onMounted, defineComponent } from 'vue';
  import { propTypes } from '@dq-next/utils/propTypes';
  import IconifyIcon from './Icon.vue';
  import { isArray } from '@dq-next/utils/is';
  import '@icon-park/vue-next/styles/index.css';

  const props = defineProps({
    icon: propTypes.string.isRequired,
    theme: propTypes.oneOf(Object.values(IconThemeEnum)).def(IconThemeEnum.MULLTI),
    size: propTypes.oneOfType([propTypes.string, propTypes.number]).def(16),
    spin: propTypes.bool.def(false),
    color: propTypes
      .oneOfType([propTypes.arrayOf(propTypes.string), propTypes.string])
      .def(['#309cf6', '#118EF8', '#FFF', '#13f19c']),
    park: propTypes.bool.def(false),
    line: propTypes.number.def(4),
  });
  const color = computed(() => (isArray(props.color) ? props.color[0] : props.color));
  const elRef = ref<Element>();
  function toPascalCase(val: string) {
    return val.replace(/(^\w|-\w)/g, function (c) {
      return c.slice(-1).toUpperCase();
    });
  }
  function setStyle() {
    const parent = elRef.value!.parentElement!;
    const inPrimaryBtn = /-btn-primary/i.test(parent.className);
    if (inPrimaryBtn) {
      return {
        fill: '#fff',
        theme: IconThemeEnum.OUTLINE,
        size: 16,
        class: 'mr-2px',
      };
    }
    const inDefaultBtn = /-btn/i.test(parent.className);
    if (inDefaultBtn) {
      return {
        theme: IconThemeEnum.OUTLINE,
        size: 16,
        class: 'mr-2px',
      };
    }
    const inDisabledBtn = parent.hasAttribute('disabled');
    if (inDisabledBtn) {
      return {
        theme: IconThemeEnum.OUTLINE,
        color: '#fcfcfc',
        size: 16,
        class: 'mr-2px',
      };
    }
    return {};
  }
  async function update() {
    if (!props.park) return;
    const params = {
      theme: props.theme,
      size: props.size,
      strokeWidth: props.line,
      fill: isArray(props.color) ? props.color : [props.color],
      spin: props.spin,
      ...setStyle(),
    };
    const type = toPascalCase(props.icon);
    if (!(type in IconMap)) {
      throw new Error(''.concat(type, ' is not a valid icon type name'));
    }
    // await nextTick();
    render(createVNode(IconMap[type], params), elRef.value!);
  }
  watch(() => props, update, { flush: 'post' });

  onMounted(update);
</script>
<style lang="less"></style>
