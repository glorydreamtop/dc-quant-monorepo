import { differenceBy, omit } from 'lodash-es';
import { CSSProperties, h, nextTick, onMounted, Ref, render, unref } from 'vue';
import { pageEventBus, useMultiSelect, useResizeListener } from '../../hooks';
import { pageSettingType, tempConfigs, TemplateDOM } from '/#/template';
import { DoubleSideChart } from '@dq-next/dchart';
import BasicText from '../Text.vue';
import BasicImg from '../Image.vue';
import { Icon } from '@dq-next/icon';
import { noop } from '@dq-next/utils';
import { useWatchArray } from '@dq-next/utils/helper/commonHelper';

interface infoType {
  page: number;
  next?: HTMLElement;
  pre?: HTMLElement;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  uniqId: string;
}

interface pagesInfoType {
  width: number;
  height: number;
}

type layoutInfoNodeMap = Map<string, Partial<infoType>>;

const layoutInfo: layoutInfoNodeMap = new Map();

const mtNode = new Set<HTMLElement>();

const pagesInfo: pagesInfoType[] = [];

const gridSize = 40;

function setPagesInfo(dom: HTMLElement) {
  const doms = Array.from(dom.getElementsByClassName('page-main') as HTMLCollectionOf<HTMLElement>);
  pagesInfo.length = 0;
  doms.forEach((dom) => {
    pagesInfo.push({
      width: dom.offsetWidth,
      height: dom.offsetHeight,
    });
  });
}

function setItem(uniqId: string, rect: Partial<infoType>) {
  layoutInfo.set(uniqId, rect);
}

function getItem(uniqId: string) {
  return layoutInfo.get(uniqId);
}

function removeItem(uniqId: string) {
  layoutInfo.delete(uniqId);
}

function addMtNode(el: HTMLElement) {
  mtNode.add(el);
}

function removeMtNode(el: HTMLElement) {
  mtNode.delete(el);
}

function getNextElement(el: HTMLElement) {
  const next = el.nextElementSibling;
  return next?.hasAttribute('data-uniqid') ? (next as HTMLElement) : undefined;
}

async function updateNextAll(el: Element | null) {
  while (el?.nextElementSibling?.hasAttribute('data-uniqid')) {
    el = el.nextElementSibling;
    (el as HTMLElement).style.gridRowStart = 'auto';
    await nextTick();
    setItem(el, {
      ...omit(el.getBoundingClientRect(), 'toJSON'),
      page: checkIntersect(el as HTMLElement),
      next: el.nextElementSibling as HTMLElement,
      pre: el.previousElementSibling as HTMLElement,
    });
  }
}

function checkIntersect(el: HTMLElement) {
  let pageIndex = NaN;
  // el.style.gridRowStart = 'auto';
  const { top: elTop, bottom: elBottom } = el.getBoundingClientRect();
  for (let index = 0; index < pagesInfo.length; index++) {
    const { top, bottom, page } = pagesInfo[index];
    if (top <= elTop && bottom >= elBottom) {
      pageIndex = page;
      el.style.gridRowStart = 'auto';
      console.log(`${el.getAttribute('data-uniqid')}不换页`);
    }
    if (Number.isNaN(pageIndex) && top <= elTop && bottom >= elTop && bottom < elBottom) {
      pageIndex = page + 1;
      console.log('换页啦');
      const { top: shouldPageTop } = pagesInfo.find((_page) => _page.page === pageIndex)!;
      const { top: baseTop } = pagesInfo[0];
      el.style.gridRowStart = `${parseInt((shouldPageTop - baseTop) / 40) + 1}`;
    }
    if (pageIndex) break;
  }
  return pageIndex;
}

function getSize(pageConfig: CSSProperties) {
  const colSpan = parseInt((pageConfig.gridColumnEnd as string).match(/\d+/g)![0]);
  const rowSpan = parseInt((pageConfig.gridRowEnd as string).match(/\d+/g)![0]);
  return {
    rowSpan,
    colSpan,
    width: colSpan * gridSize,
    height: rowSpan * gridSize,
  };
}

function getFirstDiff(arr: TemplateDOM[], pre: TemplateDOM[]) {
  for (let index = 0; index < arr.length; index++) {
    // p是undefined表明插入的新元素在最后一个
    const p = pre[index];
    if (!p || arr[index].uniqId !== pre[index]?.uniqId) {
      return {
        temp: arr[index],
        index,
      };
    }
  }
  const index = arr.length - 1;
  return {
    index,
    temp: arr[index],
  };
}

let insertSelectKeyFn: Fn = noop;
let handleEnterFn: Fn = noop;

interface createDOMParams {
  template: TemplateDOM;
  selectedTemplateDOMList: Ref<TemplateDOM[]>;
  pageSetting: pageSettingType;
  dom: HTMLElement;
}

function renderDOM({ template, selectedTemplateDOMList, pageSetting, dom }: createDOMParams) {
  const vnode = h(
    'div',
    {
      onClick: (e) => insertSelectKeyFn(template, e),
      onMouseenter: handleEnterFn,
      'data-uniqid': template.uniqId,
      // class: [
      //   'border rounded-sm overflow-hidden relative sortable m-0',
      //   selectedTemplateDOMList.value.find((node) => node.uniqId === template.uniqId)
      //     ? 'selected'
      //     : '',
      //   pageSetting.showElementborder ? '' : 'border-light-50',
      // ].join(' '),
      class: {
        'border rounded-sm overflow-hidden relative sortable m-0': true,
        selected: !!selectedTemplateDOMList.value.find((node) => node.uniqId === template.uniqId),
        'border-light-200': !pageSetting.showElementborder,
      },
      style: {
        // gridRowEnd: template.pageConfig.gridRowEnd,
        // gridColumnEnd: template.pageConfig.gridColumnEnd,
        width: template.pageConfig.width,
        height: template.pageConfig.height,
      },
    },
    [createDragIcon(), createEditIcon(template), createTempMain(template)],
  );
  let d = document.createElement('div');
  render(vnode, d);
  const item = d.children[0] as HTMLElement;
  dom.appendChild(item);
  d = void 0;
  return item;
}

function createDragIcon() {
  return h(Icon, {
    class: 'drag-handler pl-1 pt-1 !text-primary',
    icon: 'akar-icons:drag-horizontal',
  });
}

function createEditIcon(template: TemplateDOM) {
  if (['Chart'].includes(template.type)) {
    return h(Icon, {
      class: 'edit-icon absolute top-0 right-0 z-9',
      icon: 'zhanghuxiugai|svg',
      size: '24',
      onclick: setEditComp.bind(null, template),
    });
  }
}

const compTypeMap = {
  Chart: DoubleSideChart,
  Text: BasicText,
  Img: BasicImg,
};

function createTempMain(template: TemplateDOM) {
  const vnode = h(compTypeMap[template.type], {
    config: template.config,
    // onupdateConfig: (cfg: tempConfigs) => (template.config = cfg),
    class: ['w-full h-full text-base', template.type === 'Chart' ? 'py-1' : ''],
  });
  return vnode;
}

function setEditComp(temp: TemplateDOM) {
  pageEventBus.emit('editTemp', temp);
}

function getPagesDOM(container: Ref<HTMLElement | undefined>) {
  return Array.from(unref(container)!.getElementsByClassName('page-main')!) as HTMLElement[];
}

function checkOverflow(boxdom: HTMLElement) {
  for (let i = 0; i < boxdom.childElementCount; i++) {
    const child = boxdom.children[i] as HTMLElement;
    const h = child.offsetTop + child.offsetHeight;
    const w = child.offsetLeft + child.offsetWidth;
    if (h > boxdom.offsetHeight || w > boxdom.offsetWidth)
      return {
        child,
        i,
        uniqid: child.getAttribute('data-uniqid'),
      };
  }
  return false;
}

export function useLayout(
  container: Ref<HTMLElement | undefined>,
  templateList: Ref<TemplateDOM[]>,
  selectedTemplateDOMList: Ref<TemplateDOM[]>,
  pageSetting: pageSettingType,
) {
  const { insertSelectKey } = useMultiSelect(templateList, selectedTemplateDOMList);
  insertSelectKeyFn = insertSelectKey;

  const { handleEnter } = useResizeListener({
    GRIDSIZE: 40,
    templateList,
  });
  handleEnterFn = handleEnter;

  useWatchArray(templateList, (arr, pre) => {
    // 有新增元素
    if (arr.length > pre.length) {
      // 空的容器新增一个图表
      if (pre.length === 0) {
        for (let i = 0; i < arr.length; i++) {
          const temp = arr[i];
          const dom = getPagesDOM(container)[0];
          renderDOM({ template: temp, selectedTemplateDOMList, dom, pageSetting });
          setItem(temp.uniqId, { page: 1 });
        }
      } else {
        // 新增元素不是容器内第一个元素
        const { index } = getFirstDiff(arr, pre);
        for (let i = index; i < arr.length; i++) {
          const preEl = arr[i - 1];
          const insertPage = getItem(preEl.uniqId)!.page!;
          const temp = arr[i];
          const dom = getPagesDOM(container)[insertPage - 1];
          const item = renderDOM({
            template: temp,
            selectedTemplateDOMList,
            dom,
            pageSetting,
          });
          setItem(temp.uniqId, { page: insertPage });
          const overflow = checkOverflow(dom);
          console.log(overflow);
          if (overflow) {
            getPagesDOM(container)[insertPage].appendChild(item);
          }
        }
      }
    } else {
    }
  });
  onMounted(() => {
    const pagePlaceHolder = document.getElementById('pagePlaceHolder') as HTMLDivElement;
    setPagesInfo(pagePlaceHolder);
  });
  return { setItem, getItem, removeItem, setPagesInfo };
}
