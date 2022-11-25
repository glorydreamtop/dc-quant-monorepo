import { nextTick, unref } from 'vue';
import type { Ref } from 'vue';
import type { Options } from 'sortablejs';
import type SortableInstance from 'sortablejs';
import Sortable from 'sortablejs';

interface instanceType extends SortableInstance {
  doms: string[];
}

export function useSortable(el: HTMLElement | Ref<HTMLElement>, options?: Options) {
  async function initSortable() {
    await nextTick();
    if (!el) return;
    const instance: instanceType = Sortable.create(unref(el), {
      animation: 150,
      delay: 400,
      delayOnTouchOnly: true,
      ...options,
    });
    instance.doms = [];
    return instance;
  }

  return { initSortable };
}
