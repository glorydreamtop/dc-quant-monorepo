<template>
  <div :class="[prefixCls]" @click="goHome">
    <img :class="`${prefixCls}-logo`" :src="logoSrc" />
    <div class="truncate md:opacity-100" :class="`${prefixCls}__title`">
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
  import logoSrc from '/@/assets/svg/logo.svg';

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
  @sider-prefix-cls: ~'@{namespace}-layout-mix-sider';

  .@{prefix-cls}{
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &-logo {
        width: 60px;
      }

      &__title {
      color: @text-color;
      // font-weight: 700;
      transition: all 0.5s;
      line-height: 1em;
      font-family: AlimamaShuHeiTi-Bold;
    }
  }

  .login-page.@{prefix-cls}{
    gap: 20px;

    .@{prefix-cls}{
      &-logo {
        width: 70px;
      }

      &__title {
        font-size: 70px;
      }
    }
  }

  .@{sider-prefix-cls} .@{prefix-cls}{
    flex-direction: column;

    .@{prefix-cls}{
      &-logo {
        width: 40px;
      }

      &__title {
        font-size: 36px;
      }
    }
  }
</style>
