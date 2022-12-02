<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="fade-slide" mode="out-in" appear>
      <keep-alive :include="getCaches">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </transition>
  </RouterView>
  <FrameLayout v-if="getCanEmbedIFramePage" />
</template>

<script lang="ts">
  import { computed, defineComponent, unref } from 'vue';

  import FrameLayout from '/@/layouts/iframe/index.vue';

  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { useContentViewHeight } from './useContentViewHeight';

  export default defineComponent({
    name: 'PageLayout',
    components: { FrameLayout },
    setup() {
      const tabStore = useMultipleTabStore();

      const { getOpenKeepAlive, getCanEmbedIFramePage } = useRootSetting();

      const getCaches = computed((): string[] => {
        if (!unref(getOpenKeepAlive)) {
          return [];
        }
        return tabStore.getCachedTabList;
      });

      useContentViewHeight();

      return {
        getCaches,
        getCanEmbedIFramePage,
      };
    },
  });
</script>
