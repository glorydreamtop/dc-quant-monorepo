import { useResizeObserver } from '@vueuse/core';
import { floor } from 'lodash-es';
import { Directive, DirectiveBinding, App, CSSProperties, nextTick } from 'vue';
import { h, render } from 'vue';
import { on, off } from '../utils/domUtils';
import Icon from '/@/components/Icon';

const resizeDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const defaultStyle = window.getComputedStyle(el, null);
    const defaultPosition = defaultStyle.getPropertyValue('position');
    // 默认定位元素改成relative
    if (defaultPosition === 'static') {
      el.style.position = 'relative';
      el.style.overflow = 'auto';
    }
    const x = /x/i.test(binding.value);
    const y = /y/i.test(binding.value);
    const hidden = binding.arg === 'hidden';
    const iconStyle: CSSProperties = {
      fontSize: '20px',
      top: x && y ? 'calc(100% - 20px)' : x ? 'calc(50% - 10px)' : 'calc(100% - 10px)',
      right: x && y ? '0' : x ? '-10px' : 'calc(50% - 10px)',
      zIndex: '99',
      opacity: hidden ? '0' : '1',
      cursor: x && y ? 'nw-resize' : x ? 'e-resize' : 's-resize',
      position: 'absolute',
      transform: `rotate(${x && y ? '90deg' : x ? '45deg' : '135deg'})`,
    };
    if (hidden) {
      iconStyle.transition = 'opacity .2s ease-in-out';
    }
    const iconComp = h(Icon, {
      icon: 'ant-design:arrows-alt-outlined',
      style: iconStyle,
      class: 'scale-handle',
    });
    render(iconComp, el);
    const scaleHandle = el.getElementsByClassName('scale-handle')![0] as HTMLElement;
    function resizeFn() {
      on(scaleHandle, 'mousedown', mousedownListener);
      if (hidden) {
        on(scaleHandle, 'mouseover', () => {
          scaleHandle.style.opacity = '1';
        });
        on(scaleHandle, 'mouseleave', () => {
          scaleHandle.style.opacity = '0';
        });
      }
    }
    // 缩放前的宽高和鼠标开始移动前的坐标
    const posStart = {
      w: 0,
      h: 0,
      x: 0,
      y: 0,
    };
    function mousedownListener(event: MouseEvent) {
      event.preventDefault();
      posStart.x = event.clientX;
      posStart.y = event.clientY;
      posStart.w = el.offsetWidth;
      posStart.h = el.offsetHeight;
      on(document.body, 'mousemove', mousemoveListener);
      on(document.body, 'mouseup', mouseupListener);
    }
    function mousemoveListener(event: MouseEvent) {
      event.preventDefault();
      if (y) {
        const h = floor(event.clientY - posStart.y + posStart.h);
        el.style.height = `${h}px`;
      }
      if (x) {
        const w = floor(event.clientX - posStart.x + posStart.w);
        el.style.width = `${w}px`;
      }
    }
    function mouseupListener(event: MouseEvent) {
      event.preventDefault();
      off(document.body, 'mousemove', mousemoveListener);
      off(document.body, 'mouseup', mouseupListener);
    }
    resizeFn();
  },
};

export function setupResizeDirective(app: App) {
  app.directive('resizeable', resizeDirective);
}

const autoSizeDirective: Directive = {
  mounted(el: HTMLElement) {
    nextTick(() => {
      useResizeObserver(el, (entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        console.log(height);

        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
      });
    });
  },
};

export function setupAutoSizeDirective(app: App) {
  app.directive('autosize', autoSizeDirective);
}
