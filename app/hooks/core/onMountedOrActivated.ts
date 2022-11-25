import { nextTick, onMounted, onActivated, onBeforeUnmount, onDeactivated } from 'vue';

export function onMountedOrActivated(hook: Fn) {
  let mounted: boolean;

  onMounted(() => {
    hook();
    nextTick(() => {
      mounted = true;
    });
  });

  onActivated(() => {
    if (mounted) {
      hook();
    }
  });
}

export function onUnmountedOrDeactivated(hook: Fn) {
  let flag = false;

  onBeforeUnmount(() => {
    hook();
    nextTick(() => {
      flag = true;
    });
  });

  onDeactivated(() => {
    if (!flag) {
      hook();
    }
  });
}
