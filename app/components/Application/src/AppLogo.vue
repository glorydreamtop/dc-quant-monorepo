<!--
 * @Author: Vben
 * @Description: logo component
-->
<template>
  <div
    class="anticon"
    :class="[prefixCls, 'collapsed-show-title flex flex-col items-center']"
    @click="goHome"
  >
    <img :src="logoSrc" />
    <div class="ml-2 truncate md:opacity-100" :class="`${prefixCls}__title`">
      {{ title }}
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useGlobSetting } from '/@/hooks/setting';
  import { useGo } from '/@/hooks/web/usePage';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { PageEnum } from '/@/enums/pageEnum';
  import { useUserStore } from '/@/store/modules/user';
  import logoSrc from '/@/assets/images/logo.png';

  const { prefixCls } = useDesign('app-logo');
  const userStore = useUserStore();
  const { title } = useGlobSetting();
  const go = useGo();

  function goHome() {
    go(userStore.getUserInfo.homePath || PageEnum.BASE_HOME);
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &.light &__title {
      color: @primary-color;
    }

    &.dark &__title {
      color: @white;
    }

    &__title {
      font-size: 16px;
      font-weight: 700;
      transition: all 0.5s;
      line-height: normal;
    }
  }
</style>
