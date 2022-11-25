import { Directive, App, h, render } from 'vue';
import { Tooltip } from 'ant-design-vue';
import { buildShortUUID } from '../utils/uuid';

function makeEventListener(parent: HTMLElement, child: HTMLElement) {
  const types = ['mouseenter', 'mouseleave', 'mousedown', 'mouseup', 'click'];
  for (const type of types) {
    parent.addEventListener(type, () => {
      // 继承原生事件
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent(type, false, true);
      child.dispatchEvent(evt);
    });
  }
}

interface tooltipDom extends HTMLElement {
  created: boolean;
  uniqueId: string;
}

const tooltipDirective: Directive = {
  mounted(el: tooltipDom, binding) {
    if (!el.created) {
      el.created = true;
      el.uniqueId = `tooltip${buildShortUUID()}`;
    } else {
      return;
    }
    const { value, arg } = binding;
    const mask = h(el.tagName, {
      style: {
        width: '0px',
      },
      class: 'h-tooltip-helper',
    });
    const tooltipInstance = h(
      Tooltip,
      {
        placement: 'top',
        trigger: arg ?? 'hover',
        destroyTooltipOnHide: true,
        getPopupContainer: () => el,
      },
      {
        title: () => value,
        default: () => mask,
      },
    );
    render(tooltipInstance, el);
    setTimeout(() => {
      // const mask = el.querySelector('.h-tooltip-helper') as HTMLElement;
      makeEventListener(el, mask.el as HTMLElement);
      Object.assign(mask.el.style, {
        transform: `translate(${el.offsetWidth / 2}px, ${el.offsetHeight / 2}px)`,
        width: '0px',
      });
    }, 300);
  },
  unmounted: (el: tooltipDom) => {
    el.querySelector('.h-tooltip-helper')?.remove();
    Reflect.deleteProperty(el, 'created');
    Reflect.deleteProperty(el, 'uniqueId');
  },
};

export function setupTooltipDirective(app: App) {
  app.directive('tip', tooltipDirective);
}

export default tooltipDirective;
