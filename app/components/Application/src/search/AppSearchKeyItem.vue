<template>
  <span :class="$attrs.class">
    <Icon :icon="icon" />
  </span>
</template>
<script lang="ts" setup>
  import { Icon } from '@dq-next/icon';
  defineProps({
    icon: String,
  });
</script>
