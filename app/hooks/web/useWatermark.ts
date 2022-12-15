import { getCurrentInstance, onBeforeUnmount, ref, Ref, shallowRef, unref } from 'vue';
import { addResizeListener, removeResizeListener } from '@dq-next/utils/event';
import { isUndefined } from 'lodash-es';

const domSymbol = Symbol('watermark-dom');

export function useRafThrottle<T>(fn: T): T {
  let locked = false;
  // @ts-ignore
  return function (...args: any[]) {
    if (locked) return;
    locked = true;
    window.requestAnimationFrame(() => {
      // @ts-ignore
      fn.apply(this, args);
      locked = false;
    });
  };
}

export function useWatermark(
  appendEl: Ref<HTMLElement | undefined> = ref(document.body) as Ref<HTMLElement>,
) {
  const func = useRafThrottle(function () {
    const el = unref(appendEl);
    if (!el) return;
    const { clientHeight: height, clientWidth: width } = el;
    updateWatermark({ height, width });
  });
  const id = domSymbol.toString();
  const watermarkEl = shallowRef<HTMLElement>();

  const clear = () => {
    const domId = unref(watermarkEl);
    watermarkEl.value = undefined;
    const el = unref(appendEl);
    if (!el) return;
    domId && el.removeChild(domId);
    removeResizeListener(el, func);
  };

  function createBase64(str: string) {
    const can = document.createElement('canvas');
    const width = 300;
    const height = 240;
    Object.assign(can, { width, height });

    const cans = can.getContext('2d');
    if (cans) {
      cans.rotate((-20 * Math.PI) / 120);
      cans.font = '15px Vedana';
      cans.fillStyle = 'rgba(0, 0, 0, 0.15)';
      cans.textAlign = 'left';
      cans.textBaseline = 'middle';
      cans.fillText(str, width / 20, height);
    }
    return can.toDataURL('image/png');
  }

  function updateWatermark(
    options: {
      width?: number;
      height?: number;
      str?: string;
    } = {},
  ) {
    const el = unref(watermarkEl);
    if (!el) return;
    if (!isUndefined(options.width)) {
      el.style.width = `${options.width}px`;
    }
    if (!isUndefined(options.height)) {
      el.style.height = `${options.height}px`;
    }
    if (!isUndefined(options.str)) {
      el.style.background = `url(${createBase64(options.str)}) left top repeat`;
    }
  }

  const createWatermark = (str: string) => {
    if (unref(watermarkEl)) {
      updateWatermark({ str });
      return id;
    }
    const div = document.createElement('div');
    watermarkEl.value = div;
    div.id = id;
    div.style.pointerEvents = 'none';
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.position = 'absolute';
    div.style.zIndex = '100000';
    const el = unref(appendEl);
    if (!el) return id;
    const { clientHeight: height, clientWidth: width } = el;
    updateWatermark({ str, width, height });
    el.appendChild(div);
    return id;
  };

  function setWatermark(str: string) {
    createWatermark(str);
    addResizeListener(document.documentElement, func);
    const instance = getCurrentInstance();
    if (instance) {
      onBeforeUnmount(() => {
        clear();
      });
    }
  }

  return { setWatermark, clear };
}
