<template>
  <SubMenu v-if="menuInfo.children" :key="menuInfo.path">
    <template #icon>
      <Icon class="menu-icon" :icon="menuInfo.icon" />
    </template>
    <template #title>
      {{ menuInfo.name }}
    </template>
    <MenuItem v-for="menu in menuInfo.children" :key="menu.path">
      <template #icon>
        <Icon class="menu-icon" :icon="menu.icon" />
      </template>
      {{ menu.name }}
    </MenuItem>
  </SubMenu>
  <template v-else>
    <MenuItem :key="menuInfo.path">
      <template #icon>
        <Icon class="menu-icon" :icon="menuInfo.icon" />
      </template>
      {{ menuInfo.name }}
    </MenuItem>
  </template>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { SubMenu, MenuItem } from 'ant-design-vue';
  import { Icon } from '@dq-next/icon';
  import { Menu } from '/@/router/types';

  const props = defineProps<{
    menuInfo: Menu;
  }>();
</script>

<style lang="less" scoped></style>
