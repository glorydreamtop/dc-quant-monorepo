import { ref, Ref } from 'vue';
import { fnMap } from './token';

type useShowSuggestionsRes = {
  setSuggestions: (e: InputEvent) => void;
  setSuggestionsDOM: (e: Ref<HTMLElement | undefined>) => void;
  fnList: Ref<string[]>;
};

const allFnToken = Object.keys(fnMap);

export function useShowSuggestions(inputDOM: Ref<HTMLElement | undefined>): useShowSuggestionsRes {
  // 自动补全的单词列表
  const fnList = ref<string[]>([]);
  // 是否显示自动补全列表
  const show = ref(false);
  // 输入文本中待替换的子字符串结尾索引，也是用户最后输入位置
  let endOffset = 0;
  // 输入文本中待替换的子字符串开始索引
  let startOffset = 0;
  // 自动补全单词列表DOM
  const suggestionsDOM = ref<HTMLElement>();
  // 自动补全单词列表DOM原本的display属性值
  let suggestionsDOMDisplay = 'block';
  // 当前input内容是用户手输还是自动补全
  const autoComplate = ref(false);
  // 获取自动补全单词列表DOM
  function setSuggestionsDOM(e: Ref<HTMLDivElement | undefined>) {
    suggestionsDOM.value = e.value!;
    suggestionsDOMDisplay = getComputedStyle(e.value!).getPropertyValue('display');
    suggestionsDOM.value.style.display = 'none';
  }
  // 监听键盘事件
  async function keyboardListener(e: KeyboardEvent) {
    console.log(e);
    const activeElement = document.activeElement as HTMLElement;
    const str = activeElement.dataset.suggestion;
    if (str && e.key === 'Enter') {
      const dom = inputDOM.value!;
      const text = dom.innerText;
      const replaceText = fnMap[str].value;
      const str1 = text.substring(0, startOffset);
      const str2 = text.substring(endOffset);
      dom.innerText = `${str1}${replaceText}${str2}`;
      // 触发input原生事件
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('input', true, true);
      autoComplate.value = true;
      dom.dispatchEvent(evt);
      dom.focus();
      const focusDOM = window.getSelection()!.getRangeAt(0)!;
      // 设置光标位置
      focusDOM.setStart(dom.childNodes[0], startOffset + fnMap[str].endOffset);
      focusDOM.collapse(true);
      // 阻止输入回车字符
      e.preventDefault();
      autoComplate.value = false;
    }
  }
  function setSuggestions(e: InputEvent) {
    const sugDomStlye = suggestionsDOM.value!.style;
    if (autoComplate.value) {
      sugDomStlye.display = 'none';
      return;
    }
    endOffset = window.getSelection()!.getRangeAt(0).endOffset;
    const text = (e.target as HTMLDivElement)!.innerText;
    if (['(', '[', '{'].includes(text.charAt(endOffset)) || /[^a-zA-Z]/i.test(e.data!)) {
      sugDomStlye.display = 'none';
      return;
    }
    // 获得待匹配的子字符串
    let str = '';
    startOffset = endOffset - 1;
    // 匹配到字符串开头或非字母字符
    while (startOffset !== -1 && /[a-zA-Z]/i.test(text.charAt(startOffset))) {
      str = `${text.charAt(startOffset)}${str}`;
      startOffset -= 1;
    }
    startOffset += 1;
    if (str.length === 0) {
      sugDomStlye.display = 'none';
      return;
    }
    fnList.value = allFnToken.filter((s) => s.includes(str.trim()));
    if (fnList.value.length > 0) {
      const el = e.target as HTMLDivElement;
      const { x, y, width } = el.getBoundingClientRect();
      const singleLineLen = parseInt(width / 8.8);
      const left = (endOffset % singleLineLen) * 8.8 + 14 + x;
      const top = (parseInt(endOffset / singleLineLen) + 1) * 24 + y;
      Object.assign(sugDomStlye, {
        left: `${left}px`,
        top: `${top}px`,
        display: suggestionsDOMDisplay,
      });
      show.value = true;

      window.addEventListener('keypress', keyboardListener);
    } else {
      sugDomStlye.display = 'none';
      show.value = false;
      window.removeEventListener('keypress', keyboardListener);
    }
  }
  return { setSuggestions, setSuggestionsDOM, fnList };
}
