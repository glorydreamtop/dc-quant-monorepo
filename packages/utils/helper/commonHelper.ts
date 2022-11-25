import { cloneDeep } from 'lodash-es';
import { computed, unref, watch, nextTick } from 'vue';
import type { Ref } from 'vue';
import { SourceTypeEnum, SourceTypeNameEnum } from '/@/enums/quotaEnum';
import { isObject } from '../is';
import { useThrottleFn } from '@vueuse/core';

export function useWatchArray<T>(arr: Ref<T[]>, callBack: (arr: T[], pre: T[]) => void) {
  let stopWatch = false;
  const cloneArr = computed(() => cloneDeep(unref(arr)));

  watch(
    cloneArr,
    async (_, pre) => {
      if (stopWatch) return;
      stopWatch = true;
      callBack && callBack(arr.value, pre);
      await nextTick();
      stopWatch = false;
    },
    { deep: true, flush: 'post' },
  );
}

export function typeFomatter(str: SourceTypeEnum) {
  return SourceTypeNameEnum[str] || '其他';
}

export function useTaskPool() {
  function taskPool() {
    this.tasks = [];
    this.pool = [];
    this.limit = 5;
  }
  taskPool.prototype.addTask = function (task) {
    this.tasks.push(task);
    this.run();
  };
  taskPool.prototype.run = function () {
    if (this.tasks.length === 0) return;
    const min = Math.min(this.tasks.length, this.max - this.pool.length);
    for (let i = 0; i < min; i++) {
      const currTask = this.tasks.shift();
      this.pool.push(currTask);
      currTask()
        .then((res) => {
          console.log(new Date().getTime() - res);
        })
        .catch((_) => {})
        .finally(() => {
          this.pool.splice(this.pool.indexOf(currTask), 1);
          this.run();
        });
    }
  };
  return taskPool;
}

// type mergeAndRemoveOptions = {
//   excludes: string[];
// };

export function mergeAndRemove(target: object, source: object) {
  for (const key in target) {
    // 继承属性不管
    if (!target.hasOwnProperty(key)) continue;
    const sourceHas = Reflect.has(source, key);
    if (sourceHas) {
      if (isObject(target[key]) && isObject(source[key])) {
        mergeAndRemove(target[key], source[key]);
      } else {
        target[key] = cloneDeep(source[key]);
      }
    } else {
      Reflect.deleteProperty(target, key);
    }
  }
  for (const key in source) {
    const targetHas = Reflect.has(target, key);
    if (!targetHas) {
      target[key] = cloneDeep(source[key]);
    }
  }
}

export async function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

/**
 *
 * @param {Object} doms 相关DOM
 * @param {Object} doms.container 容器DOM
 * @param {Object} doms.boxName 可伸缩节点CSS选择器
 * @param {Object} doms.scaleName 控制节点CSS选择器
 * @param {Object} direction 允许变化方向
 * @param {Boolean} staticMode 是否需要处理容器任意时间新加入的子元素
 */
export function useScaleable(
  { container, boxName, scaleName }: param,
  { x, y, staticMode, onEnd } = {
    x: true,
    y: true,
    staticMode: false,
    onEnd: function () {},
  },
) {
  if (staticMode) {
    resize({ container, boxName, scaleName }, { x, y, onEnd });
  } else {
    // 创建观察者对象
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function () {
        resize({ container, boxName, scaleName }, { x, y, onEnd });
      });
    });
    const config = { childList: true };
    observer.observe(container, config);
  }
}
interface param {
  container: HTMLElement;
  boxName: string;
  scaleName: string;
}
function resize({ container, boxName, scaleName }: param, { x, y, onEnd }) {
  // @ts-ignore
  const boxes: HTMLElement[] = container.querySelectorAll(boxName) as HTMLElement[];
  boxes.forEach((box) => {
    const scale = box.querySelector(scaleName)! as HTMLElement;
    // const baseHeight = container.clientHeight;
    scale.onmousedown = function (e) {
      // 阻止冒泡,避免缩放时触发移动事件
      e.stopPropagation();
      e.preventDefault();
      const pos = {
        w: box.offsetWidth,
        h: box.offsetHeight,
        x: e.clientX,
        y: e.clientY,
      };

      container.onmousemove = function (ev) {
        const throttleHandle = useThrottleFn(function () {
          ev.preventDefault();
          let w, h;
          if (x) {
            w = Math.max(30, ev.clientX - pos.x + pos.w);
            w =
              w >= container.offsetWidth - box.offsetLeft
                ? container.offsetWidth - box.offsetLeft
                : w;
          }
          if (y) {
            h = Math.max(30, ev.clientY - pos.y + pos.h);
            // if (resizeable) {
            //   if (h >= container.offsetHeight - box.offsetTop) {
            //     container.style.height = container.offsetHeight + 100 + 'px';
            //     h = container.offsetHeight - box.offsetTop;
            //   } else {
            //     container.style.height = baseHeight + 'px';
            //   }
            // }
          }
          box.style.width = w + 'px';
          box.style.height = h + 'px';
        }, 18);
        throttleHandle();
      };

      container.onmouseleave = function () {
        container.onmousemove = null;
        container.onmouseup = null;
        onEnd && onEnd(box);
      };
      container.onmouseup = function () {
        container.onmousemove = null;
        container.onmouseup = null;
        onEnd && onEnd(box);
      };
    };
  });
}
