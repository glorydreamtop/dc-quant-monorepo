<template>
  <div @contextmenu="handleContext">
    <Image :style="style" :src="config.url" :fallback="fallback" :preview="false" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ComputedRef, CSSProperties, toRefs } from 'vue';
  import { Image } from 'ant-design-vue';
  import type { ImgConfig } from '/#/template';
  import { useContextMenu } from '/@/hooks/web/useContextMenu';
  import { useI18n } from '/@/hooks/web/useI18n';
  const props = defineProps<{
    config: ImgConfig;
  }>();
  const { t } = useI18n();
  const [createContextMenu] = useContextMenu();
  const fallback = 'https://img.shducheng.net/cms/downloadFile?fileKey=files/no-img.svg';
  const { config } = toRefs(props);
  const style: ComputedRef<CSSProperties> = computed(() => ({
    objectFit: config.value.mode,
  }));

  function handleContext(e: MouseEvent) {
    createContextMenu({
      event: e,
      items: [
        {
          label: t('templateView.view.img.contextMenu.fill'),
          handler: () => {
            config.value.mode = 'fill';
          },
        },
        {
          label: t('templateView.view.img.contextMenu.cover'),
          handler: () => {
            config.value.mode = 'cover';
          },
        },
        {
          label: t('templateView.view.img.contextMenu.contain'),
          handler: () => {
            config.value.mode = 'contain';
          },
        },
        {
          label: t('templateView.view.img.contextMenu.none'),
          handler: () => {
            config.value.mode = 'none';
          },
        },
      ],
    });
  }
</script>

<style lang="less" scoped>
  ::v-deep(.ant-image) {
    width: 100%;
    height: 100%;

    img {
      height: 100%;
    }
  }

  ::v-deep(.ant-image.ant-image-error) {
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 250px;
    }
  }
</style>
