<template>
  <div class="relative overflow-visible">
    <div
      class="formula-editor focus:outline-blue-600 rounded-md"
      ref="formulaEditorRef"
      contenteditable
      @input="formulaChange"
      @blur="updateFormula"
    ></div>
    <pre class="language-javascript code rounded-sm" ref="formulaCodeRef"></pre>
    <div
      ref="suggestionsRef"
      class="fixed z-19 flex flex-col min-w-16 max-h-17 bg-white rounded-sm overflow-y-scroll divide-y divide-gray-300"
    >
      <span
        v-for="item in fnList"
        :key="item"
        :data-suggestion="item"
        tabIndex="0"
        class="pl-1 focus:bg-primary focus:text-white leading-4 text-gray-500 relative"
      >
        <span>{{ item }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref, watch, nextTick } from 'vue';
  import { onMountedOrActivated } from '/@/hooks/core/onMountedOrActivated';
  import { useResizeObserver } from '@vueuse/core';
  import { useShowSuggestions } from './helper';
  const props = defineProps({
    formula: {
      type: String,
      required: true,
    },
  });
  const emit = defineEmits<{
    (event: 'update:formula', formula: string): void;
    (event: 'updateEndOffset', endOffset: number): void;
  }>();
  const formulaCodeRef = ref<HTMLPreElement>();
  const formulaEditorRef = ref<HTMLDivElement>();
  const suggestionsRef = ref<HTMLElement>();
  const { setSuggestions, setSuggestionsDOM, fnList } = useShowSuggestions(formulaEditorRef);
  // 文本变化时重新渲染高亮
  function formulaChange(e: InputEvent) {
    const el = formulaCodeRef.value!;
    const text = (e.target as HTMLDivElement)!.innerText;
    el.innerHTML = text;
    hljs.highlightElement(el);
    setSuggestions(e);
    nextTick();
    emit('updateEndOffset', window.getSelection()!.getRangeAt(0).endOffset);
  }
  // 失去焦点时向外传递结果
  function updateFormula(e: FocusEvent) {
    emit('updateEndOffset', window.getSelection()!.getRangeAt(0).endOffset);
    emit('update:formula', (e.target as HTMLDivElement)!.innerText);
  }
  // 允许拖拽编辑器大小
  onMountedOrActivated(() => {
    const el = formulaCodeRef.value!;
    useResizeObserver(unref(formulaEditorRef), (e) => {
      const target = e[0].target as HTMLDivElement;
      el.style.height = target.offsetHeight + 'px';
      el.style.width = target.offsetWidth + 'px';
      el.parentElement!.style.height = target.offsetHeight + 'px';
    });
    setSuggestionsDOM(suggestionsRef);
    hljs.highlightElement(el);
  });
  watch(
    props,
    (v) => {
      // 外部传入公式代码时渲染高亮
      const el = formulaCodeRef.value!;
      formulaEditorRef.value!.innerText = v.formula;
      el.innerHTML = v.formula;
      hljs.highlightElement(el);
    },
    { deep: true },
  );
</script>

<style lang="less" scoped>
  .formula-editor {
    caret-color: #b8b8b8;
    position: absolute;
    overflow: hidden;
    resize: vertical;
    width: 100%;
    height: 7.5rem;
    z-index: 9;
    padding: 4px 11px;
    font-size: 16px;
    line-height: 24px;
    color: transparent;
    white-space: wrap;
    word-wrap: break-word;
    word-break: break-all;
    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  }

  .code {
    padding: 4px 11px;
    position: absolute;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    font-size: 16px;
    line-height: 24px;
    top: 0;
    text-align: left;
    width: 100%;
    pointer-events: none;
  }
</style>
