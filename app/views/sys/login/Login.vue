<template>
  <div :class="prefixCls" class="relative w-full h-full px-4">
    <div class="container relative h-full py-2 mx-auto sm:px-10 flex h-full">
      <div class="min-h-full pl-4 mr-4 xl:flex xl:flex-col xl:w-6/12">
        <AppLogo class="-enter-x login-page" />
        <div class="my-auto">
          <img
            :alt="title"
            src="../../../assets/svg/login-box-bg.svg"
            class="w-1/2 -mt-16 -enter-x"
          />
          <div class="mt-10 font-medium text-white -enter-x">
            <span class="inline-block mt-4 text-3xl"> {{ t('sys.login.signInTitle') }}</span>
          </div>
          <div class="mt-5 font-normal text-white text-md dark:text-gray-500 -enter-x">
            {{ t('sys.login.signInDesc') }}
          </div>
        </div>
      </div>
      <div class="flex w-full h-full py-5 xl:h-auto xl:py-0 xl:my-0 xl:w-6/12">
        <div
          :class="`${prefixCls}-form`"
          class="relative w-full px-5 py-8 mx-auto my-auto rounded-md shadow-md xl:ml-16 xl:bg-transparent sm:px-8 xl:p-4 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto enter-x"
        >
          <LoginForm />
          <!-- <ForgetPasswordForm />
            <RegisterForm />
            <MobileForm />
            <QrCodeForm /> -->
        </div>
      </div>
    </div>
    <!-- <div class="icp">
      <a
        target="_blank"
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=33010202002169"
      >
        <img src="/src/assets/images/icp.png" style="float: left" />
        <span>浙公网安备 33010202002169号</span>
      </a>
      <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer"
        >浙ICP备2022009116号</a
      >
    </div> -->
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { AppLogo } from '/@/components/Application';
  import { AppLocalePicker, AppDarkModeToggle } from '/@/components/Application';
  import LoginForm from './LoginForm.vue';
  // import ForgetPasswordForm from './ForgetPasswordForm.vue';
  // import RegisterForm from './RegisterForm.vue';
  // import MobileForm from './MobileForm.vue';
  // import QrCodeForm from './QrCodeForm.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLocaleStore } from '/@/store/modules/locale';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { useUserStore } from '/@/store/modules/user';
  import { useAppStore } from '/@/store/modules/app';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { removeTabChangeListener } from '/@/logics/mitt/routeChange';

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');

  onMounted(() => {
    const tabStore = useMultipleTabStore();
    const userStore = useUserStore();
    const appStore = useAppStore();
    const permissionStore = usePermissionStore();
    appStore.resetAllState();
    permissionStore.resetState();
    tabStore.resetState();
    userStore.resetState();
    removeTabChangeListener();
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-login';
  @logo-prefix-cls: ~'@{namespace}-app-logo';
  @countdown-prefix-cls: ~'@{namespace}-countdown-input';
  @dark-bg: #293146;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg;

      &::before {
        background-image: 'url(/@/assets/svg/login-bg-dark.svg)';
      }

      .ant-input,
      .ant-input-password {
        background-color: #232a3b;
      }

      .ant-btn:not(.ant-btn-link):not(.ant-btn-primary) {
        border: 1px solid #4a5569;
      }

      &-form {
        background: transparent !important;
      }

      .app-iconify {
        color: #fff;
      }
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }
  }

  html[data-theme='light'] {
    .@{prefix-cls}::before {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      // margin-left: -48%;
      background-image: url('https://bing.biturl.top/?resolution=1366&format=image&index=0&mkt=zh-CN');
      background-position: 100%;
      background-repeat: no-repeat;
      background-size: cover;
      content: '';
      // @media (max-width: @screen-xl) {
      //   display: none;
      // }

      filter: blur(20px);
    }
  }
  .@{prefix-cls} {
    min-height: 100%;
    overflow: hidden;
    @media (max-width: @screen-xl) {
      background-color: #293146;

      .@{prefix-cls}-form {
        background-color: #fff;
      }
    }

    &-sign-in-way {
      .anticon {
        font-size: 22px;
        color: #888;
        cursor: pointer;

        &:hover {
          color: @primary-color;
        }
      }
    }

    input:not([type='checkbox']) {
      min-width: 360px;

      @media (max-width: @screen-xl) {
        min-width: 320px;
      }

      @media (max-width: @screen-lg) {
        min-width: 260px;
      }

      @media (max-width: @screen-md) {
        min-width: 240px;
      }

      @media (max-width: @screen-sm) {
        min-width: 160px;
      }
    }

    input.captcha {
      min-width: unset;
    }

    .captcha-img {
      height: 40px;
    }

    .@{countdown-prefix-cls} input {
      min-width: unset;
    }

    .ant-divider-inner-text {
      font-size: 12px;
      color: @text-color-secondary;
    }
  }

  .icp {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    display: flex;
    align-items: center;
    gap: 20px;

    a {
      color: inherit;
    }
  }
</style>
