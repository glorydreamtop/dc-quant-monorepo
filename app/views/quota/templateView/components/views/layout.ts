import { useMutationObserver } from '@vueuse/core';
import { omit } from 'lodash-es';
import { nextTick, onMounted, Ref } from 'vue';

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
}

type layoutInfoNodeMap = Map<Element, infoType>;

const layoutInfo: layoutInfoNodeMap = new Map();

const mtNode = new Set<HTMLElement>();

const pagesInfo: Omit<infoType, 'next' | 'pre'>[] = [];

// function getRect(el: HTMLElement | null) {
//   const rect = {
//     width: el?.offsetWidth ?? 0,
//     height: el?.offsetHeight ?? 0,
//     top: el?.offsetTop ?? 0,
//     left: el?.offsetLeft ?? 0,
//     bottom: (el?.offsetTop ?? 0) + (el?.offsetHeight ?? 0),
//     right: (el?.offsetWidth ?? 0) + (el?.offsetLeft ?? 0),
//   };
//   return rect;
// }

function setPagesInfo(dom: HTMLElement) {
  const doms = Array.from(dom.getElementsByClassName('page-main'));
  pagesInfo.length = 0;
  doms.forEach((page, index) => {
    const rect = page.getBoundingClientRect();
    pagesInfo.push({
      page: index + 1,
      ...omit(rect, 'toJSON'),
    });
  });
}

function setItem(el: Element | null, rect: infoType) {
  if (!el) return;
  layoutInfo.set(el, rect);
}

function getItem(el: Element) {
  return layoutInfo.get(el);
}

function removeItem(el: Element) {
  layoutInfo.delete(el);
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
    await nextTick()
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
      removeMtNode(el);
    }
    if (Number.isNaN(pageIndex) && top <= elTop && bottom >= elTop && bottom < elBottom) {
      pageIndex = page + 1;
      console.log('换页啦');

      const { top: shouldPageTop } = pagesInfo.find((_page) => _page.page === pageIndex)!;
      const { top: baseTop } = pagesInfo[0];
      el.style.gridRowStart = `${parseInt((shouldPageTop - baseTop) / 40) + 1}`;
      addMtNode(el);
    }
    if (pageIndex) break;
  }
  return pageIndex;
}

export function useLayout(container: Ref<HTMLElement | undefined>) {
  onMounted(() => {
    const pagePlaceHolder = document.getElementById('pagePlaceHolder') as HTMLDivElement;
    useMutationObserver(
      container,
      ([{ addedNodes, removedNodes }]) => {
        setPagesInfo(pagePlaceHolder);
        // 添加元素
        if (addedNodes.length > 0) {
          const first = addedNodes[0] as HTMLElement;
          const pre = first.previousElementSibling as HTMLElement;
          const last = addedNodes[addedNodes.length - 1] as HTMLElement;
          const next = getNextElement(last);
          const rect = first.getBoundingClientRect();
          setItem(first, {
            ...omit(rect, 'toJSON'),
            page: checkIntersect(first),
            pre,
            next: getNextElement(first),
          });
          if (pre) {
            setItem(pre, {
              ...getItem(pre)!,
              next: first,
            });
          }
          if (next) {
            setItem(next, {
              ...getItem(next)!,
              pre: last,
            });
          }
          updateNextAll(last!);
        }
        // 移除元素
        if (removedNodes.length > 0) {
          const lastNode = removedNodes[removedNodes.length - 1] as HTMLElement;
          const pre = getItem(removedNodes[0] as Element)?.pre;
          const next = getItem(lastNode)?.next;
          if (pre) {
            setItem(pre, { ...getItem(pre)!, next });
          }
          if (next) {
            setItem(next, { ...getItem(next)!, pre });
            updateNextAll(next.previousElementSibling);
          }
          removedNodes.forEach((el: HTMLElement) => {
            removeItem(el);
          });
        }
        console.log(layoutInfo);
      },
      {
        childList: true,
      },
    );
  });
  return { setItem, getItem, removeItem, setPagesInfo };
}
