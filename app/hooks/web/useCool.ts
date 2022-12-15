import { onUnmounted, Ref, ref } from 'vue';
import { oneSentence } from '@dq-next/http-apis/cool';
import lottie from 'lottie-web';
import { isBoolean, isNumber } from 'lodash-es';
import { warn } from '@dq-next/utils/log';

export async function getSentence() {
  const str = ref('');

  str.value = await oneSentence();
}

interface lottieParams {
  container: Element;
  loop: boolean;
  autoplay: boolean;
  render?: 'svg' | 'canvas';
  path: string;
}
export function useLottie({ container, loop, autoplay, path }: lottieParams) {
  const anim = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop,
    autoplay,
    path,
  });
  return anim;
}

interface useCycleOptions {
  delay?: number;
  waitPrev?: boolean;
  keepAlive?: boolean;
}

type useCycleRes<T> = [
  Ref<T | undefined>,
  {
    start: () => void;
    stop: () => number;
    pause: () => number;
    getStatus: () => boolean;
    getCount: () => number;
  },
];
/**
 * @description start: 开始循环, stop: 终止循环并清零循环次数, getCount: 获取循环次数, pause: 暂停, getStatus: 循环是否进行中
 * waitPrev: 是否等待上一次循环结束,delay: 延迟时间
 * @example useCycle(fn,{ delay: 1000, waitPrev: true })
 *
 **/

export function useCycle<T>(fn: () => T | Promise<T>, options?: useCycleOptions): useCycleRes<T> {
  const config = { delay: 10 * 1000, waitPrev: false, keepAlive: false };
  Object.assign(config, options);
  const count = ref(0);
  const timer = ref<any>(null);
  const res = ref<T>();
  const running = ref(false);
  if (!fn || !isNumber(config.delay) || !isBoolean(config.waitPrev)) {
    warn('useCycle params error');
    //@ts-ignore
    return;
  }

  const start = () => {
    running.value = true;
    if (config.waitPrev) {
      timer.value = setTimeout(() => {
        (fn() as Promise<T>).then((r) => {
          count.value++;
          start();
          res.value = r;
        });
      }, config.delay);
    } else {
      timer.value = setInterval(async () => {
        count.value++;
        res.value = await fn();
      }, config.delay);
    }
  };
  const clear = () => {
    config.waitPrev && clearTimeout(timer.value);
    !config.waitPrev && clearInterval(timer.value);
    running.value = false;
    timer.value = null;
  };
  const stop = () => {
    clear();
    const _count = count.value;
    count.value = 0;
    return _count;
  };
  const getCount = () => count.value;
  const pause = () => {
    clear();
    return count.value;
  };
  const getStatus = () => running.value;
  onUnmounted(() => {
    !config.keepAlive && stop();
  });
  return [res, { start, stop, getCount, pause, getStatus }];
}
