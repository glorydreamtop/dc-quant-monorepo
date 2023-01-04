<template>
  <div
    class="w-1200px absolute paint-container"
    ref="gridContainer"
    @click.self="clearSelectKey"
    :style="gridAreaStyle"
  >
    <div
      v-for="element in templateList"
      :key="element.uniqId"
      @click="insertSelectKey(element, $event)"
      @mouseenter="handleEnter"
      :data-uniqid="element.uniqId"
      :class="[
        'border rounded-sm overflow-hidden relative sortable  m-0',
        selectedTemplateDOMList.find((node) => node.uniqId === element.uniqId) ? 'selected' : '',
        pageSetting.showElementborder ? '' : 'border-light-50',
      ]"
      :style="{
        gridRowEnd: element.pageConfig.gridRowEnd,
        gridColumnEnd: element.pageConfig.gridColumnEnd,
      }"
    >
      <Icon icon="akar-icons:drag-horizontal" class="drag-handler pl-1 pt-1 !text-primary" />
      <Icon
        v-if="['Chart'].includes(element.type)"
        @click="setEditComp(element)"
        icon="zhanghuxiugai|svg"
        size="24"
        class="edit-icon absolute top-0 right-0 z-9"
      />
      <component
        :is="compTypeMap[element.type]"
        v-model:config="element.config"
        :class="['w-full h-full text-base', element.type === 'Chart' ? 'py-1' : '']"
      />
    </div>
    <div
      class="cursor-insert pointer-events-none animate__animated animate__infinite animate__flash animate__slow"
      :style="insertPosition"
    ></div>
  </div>
</template>

<script lang="ts" setup>
  import { useResizeObserver } from '@vueuse/core';
  import { last, isNil } from 'lodash-es';
  import {
    CSSProperties,
    onMounted,
    ref,
    toRefs,
    unref,
    nextTick,
    reactive,
    watchEffect,
  } from 'vue';
  import {
    useMultiSelect,
    usePageSettingContext,
    useResizeListener,
    useSelectTemplateListContext,
    useTemplateListContext,
    pageEventBus,
  } from '../../hooks';
  import { TemplateDOM } from '/#/template';
  import { useSortable } from '/@/hooks/web/useSortable';
  import { DoubleSideChart } from '@dq-next/dchart';
  import BasicText from '../Text.vue';
  import BasicImg from '../Image.vue';
  import { useLayout } from './layoutabs';

  const props = defineProps<{
    gridAreaStyle: CSSProperties;
  }>();

  const { gridAreaStyle } = toRefs(props);

  const compTypeMap = {
    Chart: DoubleSideChart,
    Text: BasicText,
    Img: BasicImg,
  };

  // 选中的模块
  const selectedTemplateDOMList = useSelectTemplateListContext();
  const templateList = useTemplateListContext();
  const pageSetting = usePageSettingContext();

  const { insertSelectKey, clearSelectKey } = useMultiSelect(templateList, selectedTemplateDOMList);

  const { handleEnter } = useResizeListener({
    GRIDSIZE: 40,
    templateList,
  });

  function setEditComp(temp: TemplateDOM) {
    pageEventBus.emit('editTemp', temp);
  }

  const insertPosition = reactive({
    display: 'none',
    top: `0px`,
    left: `0px`,
    height: `0px`,
  });
  watchEffect(
    () => {
      const list = selectedTemplateDOMList.value;
      const el = gridContainer.value?.querySelector(
        `[data-uniqid=${
          list.length > 0
            ? list.length === 1
              ? list[0].uniqId
              : null
            : templateList.value.at(-1)?.uniqId
        }]`,
      ) as HTMLElement;
      Object.assign(insertPosition, {
        display: el ? 'initial' : 'none',
        top: `${(el?.clientTop ?? 4) - 8}px`,
        left: `${(el?.clientLeft ?? 0) + (el?.clientWidth ?? 2) - 2}px`,
        height: `${(el?.clientHeight ?? 0) + 16}px`,
      });
    },
    {
      flush: 'post',
    },
  );

  const gridContainer = ref<HTMLElement>();
  const { setItem, getItem, removeItem, setPagesInfo } = useLayout(gridContainer, templateList);
  onMounted(async () => {
    await nextTick();
    const boxdom = unref(gridContainer)!;
    const pagePlaceHolder = document.getElementById('pagePlaceHolder') as HTMLDivElement;
    // setPagesInfo(pagePlaceHolder);
    useResizeObserver(pagePlaceHolder, ([{ target }]) => {
      const pages = pagePlaceHolder.getElementsByClassName('page-main')!;
      const { bottom } = last(pages)!.getBoundingClientRect();
      const { top } = pages[0].getBoundingClientRect();
      boxdom.style.height = `${bottom - top}px`;
      // setPagesInfo(target as HTMLElement);
    });
    // 支持拖动排序
    const { initSortable } = useSortable(boxdom, {
      handle: '.drag-handler',
      draggable: '.sortable',
      dataIdAttr: 'data-uniqid',
      dragoverBubble: true,
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (isNil(oldIndex) || isNil(newIndex) || oldIndex === newIndex) {
          return;
        }
        // Sort column
        const columns = templateList.value;
        if (oldIndex > newIndex) {
          columns.splice(newIndex, 0, columns[oldIndex]);
          columns.splice(oldIndex + 1, 1);
        } else {
          columns.splice(newIndex + 1, 0, columns[oldIndex]);
          columns.splice(oldIndex, 1);
        }
      },
    });
    initSortable();
  });
</script>

<style lang="less" scoped>
  .no-scrollbar::-webkit-scrollbar {
    width: 0;
  }

  .selected {
    @apply shadow-sm shadow-primary;

    z-index: 9;
    border: 1px solid;
    border-color: @primary-color;
  }
  // 光标
  .cursor-insert {
    position: absolute;
    width: 4px;
    background-color: rgba(27, 145, 255, 1);
    z-index: 9;
    transition-property: height, top, left;
    transition-duration: 0.3s;
    border-radius: 2px;
  }

  .sortable {
    box-sizing: border-box;
    transition: border 0.3s;
    background-color: @white;
    // position: absolute;

    ::v-deep(.autohidden-toolbar) {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover {
      resize: both;

      .drag-handler,
      .edit-icon {
        opacity: 1;
      }

      ::v-deep(.autohidden-toolbar) {
        opacity: 1;
      }
    }

    .drag-handler,
    .edit-icon {
      opacity: 0;
      position: absolute;
      z-index: 9;
      transition: opacity 0.2s;
    }
  }

  .paint-container {
    transform: scale(v-bind('pageSetting.scale/100'));
    transform-origin: 50% 0;
    // display: flex;
    // flex-wrap: wrap;
    // justify-content: flex-start;
    // align-content: flex-start;
    display: grid;
    grid-template-columns: repeat(30, 40px);
    grid-template-rows: repeat(auto-fill, 40px);
  }
</style>
