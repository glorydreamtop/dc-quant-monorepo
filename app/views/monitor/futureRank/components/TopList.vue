<template>
  <div class="h-full overflow-y-scroll relative bg-white">
    <slot></slot>
    <div
      class="flex text-center h-10 items-center even:bg-gray-50 border-b border-gray-100"
      v-for="(item, index) in dataList"
      :key="item.memberName"
    >
      <div class="w-20">{{ index + 1 }}</div>
      <div class="flex items-center flex-grow">
        <div
          class="w-1/3 text-primary cursor-pointer"
          @click="openDetail(item.memberName, item.productId)"
          >{{ item.memberName }}</div
        >
        <div class="w-1/3">{{ item.volume }}</div>
        <div :class="['w-1/3', `text-${item.volumeChange >= 0 ? 'red' : 'green'}-600`]">
          <span>{{ item.volumeChange >= 0 ? '+' : '' }}</span>
          <span>{{ item.volumeChange }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { toRefs } from 'vue';
  import type { RankResult } from '../../../../api/future/model';

  const props = defineProps<{
    dataList: RankResult;
  }>();
  const emit = defineEmits<{
    (event: 'openDetail', memberName: string, productId: string): void;
  }>();
  const { dataList } = toRefs(props);

  function openDetail(memberName: string, productId: string) {
    emit('openDetail', memberName, productId);
  }
</script>

<style lang="less" scoped></style>
