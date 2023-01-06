<template>
  <Dropdown
    :dropMenuList="getDropMenuList"
    :trigger="['contextmenu']"
    placement="bottom"
    overlayClassName="multiple-tabs__dropdown"
    @menu-event="handleMenuEvent"
  >
    <div :class="`${prefixCls}__info`" @contextmenu="handleContext">
      <span class="ml-1">{{ getTitle }}</span>
    </div>
  </Dropdown>
</template>
<script lang="ts" setup name="TabContent">
  import type { RouteLocationNormalized } from 'vue-router';

  import { computed } from 'vue';
  import { Dropdown } from '/@/components/Dropdown/index';

  import { TabContentProps } from '../types';

  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useTabDropdown } from '../useTabDropdown';

  const props = defineProps<{
    tabItem: RouteLocationNormalized;
  }>();
  const { prefixCls } = useDesign('multiple-tabs-content');
  const { t } = useI18n();

  const getTitle = computed(() => {
    const { tabItem: { meta } = {} } = props;
    return meta && t(meta.title as string);
  });

  const { getDropMenuList, handleMenuEvent, handleContextMenu } = useTabDropdown(
    props as TabContentProps,
  );

  function handleContext(e) {
    props.tabItem && handleContextMenu(props.tabItem)(e);
  }
</script>
