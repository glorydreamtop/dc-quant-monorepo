<template>
  <div :class="[prefixCls]">
    <AppLogo :showTitle="false" :class="`${prefixCls}-logo`" />
    <AMenu
      v-model:selected-keys="activePath"
      v-model:open-keys="openKeys"
      mode="vertical"
      @click="menuClick"
    >
      <BasicMenu v-for="item in menuList" :key="item.path" :menu-info="item" />
    </AMenu>
  </div>
</template>

<script lang="ts" setup name="LayoutMixSider">
  import { computed, onMounted, ref } from 'vue';
  import { Menu as AMenu } from 'ant-design-vue';
  import { getAsyncMenus, getCurrentParentPath } from '/@/router/menus';
  import { Menu } from '/@/router/types';
  import BasicMenu from './BasicMenu.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { AppLogo } from '/@/components/Application';
  import { useRouter } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';

  const { prefixCls } = useDesign('layout-mix-sider');
  const router = useRouter();
  const go = useGo();

  const menuList = ref<Menu[]>([]);
  onMounted(() => {
    menuList.value = getAsyncMenus();
    console.log(menuList.value);
  });
  const activePath = computed(() => [router.currentRoute.value.path]);
  const openKeys = computed(() => [getCurrentParentPath(router.currentRoute.value.path)]);

  function menuClick({ key }: { key: string }) {
    go(key);
  }
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-layout-mix-sider';

  .@{prefix-cls} {
    height: 100vh;
    overflow: hidden;
    background-color: #ffffff;
    transition: all 0.2s ease 0s;
    border-right: 1px solid #e5e7eb;
    box-shadow: #c3c3c385 4px 0px 10px;

    &-logo {
      display: flex;
      padding: 24px 0;
      justify-content: center;

      img {
        width: @logo-width;
        height: @logo-width;
      }
    }

    .ant-menu.ant-menu-vertical {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }

    .ant-menu-submenu.ant-menu-submenu-vertical {
      position: relative;
      background-color: @component-background;
      transition: background-color 0.2s ease;

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        width: 3px;
        height: 100%;
        background-color: transparent;
        transition: background-color 0.2s ease;
      }

      &.ant-menu-submenu-selected {
        background-color: lighten(@primary-color, 40%);

        &::after {
          background-color: lighten(@primary-color, 10%);
        }
      }
    }

    .ant-menu-item,
    .ant-menu-submenu-title {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: auto !important;
      margin-top: 0;
      margin-bottom: 0;

      .ant-menu-title-content {
        margin-left: 0;
        color: @text-color-secondary !important;
        line-height: 2.2em;
      }
    }

    .ant-menu-submenu-title {
      padding-right: 16px;
      padding-top: 10px;

      .ant-menu-submenu-arrow {
        display: none;
      }
    }

    .menu-icon {
      font-size: 20px !important;
    }
  }
</style>
