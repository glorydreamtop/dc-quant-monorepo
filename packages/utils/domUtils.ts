import { FunctionArgs, useDebounceFn } from '@vueuse/core';
import { upperFirst } from 'lodash-es';
import { dataURLtoBlob, dataURLtoFile } from './file/base64Conver';
import html2canvas from 'html2canvas';

export interface ViewportOffsetResult {
  left: number;
  top: number;
  right: number;
  bottom: number;
  rightIncludeBody: number;
  bottomIncludeBody: number;
}

export function getBoundingClientRect(element: Element): DOMRect | number {
  if (!element || !element.getBoundingClientRect) {
    return 0;
  }
  return element.getBoundingClientRect();
}

function trim(string: string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
}

/* istanbul ignore next */
export function hasClass(el: Element, cls: string) {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}

/* istanbul ignore next */
export function addClass(el: Element, cls: string) {
  if (!el) return;
  let curClass = el.className;
  const classes = (cls || '').split(' ');

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.add(clsName);
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

/* istanbul ignore next */
export function removeClass(el: Element, cls: string) {
  if (!el || !cls) return;
  const classes = cls.split(' ');
  let curClass = ' ' + el.className + ' ';

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ');
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}
/**
 * Get the left and top offset of the current element
 * left: the distance between the leftmost element and the left side of the document
 * top: the distance from the top of the element to the top of the document
 * right: the distance from the far right of the element to the right of the document
 * bottom: the distance from the bottom of the element to the bottom of the document
 * rightIncludeBody: the distance between the leftmost element and the right side of the document
 * bottomIncludeBody: the distance from the bottom of the element to the bottom of the document
 *
 * @description:
 */
export function getViewportOffset(element: Element): ViewportOffsetResult {
  const doc = document.documentElement;

  const docScrollLeft = doc.scrollLeft;
  const docScrollTop = doc.scrollTop;
  const docClientLeft = doc.clientLeft;
  const docClientTop = doc.clientTop;

  const pageXOffset = window.pageXOffset;
  const pageYOffset = window.pageYOffset;

  const box = getBoundingClientRect(element);

  const { left: retLeft, top: rectTop, width: rectWidth, height: rectHeight } = box as DOMRect;

  const scrollLeft = (pageXOffset || docScrollLeft) - (docClientLeft || 0);
  const scrollTop = (pageYOffset || docScrollTop) - (docClientTop || 0);
  const offsetLeft = retLeft + pageXOffset;
  const offsetTop = rectTop + pageYOffset;

  const left = offsetLeft - scrollLeft;
  const top = offsetTop - scrollTop;

  const clientWidth = window.document.documentElement.clientWidth;
  const clientHeight = window.document.documentElement.clientHeight;
  return {
    left: left,
    top: top,
    right: clientWidth - rectWidth - left,
    bottom: clientHeight - rectHeight - top,
    rightIncludeBody: clientWidth - left,
    bottomIncludeBody: clientHeight - top,
  };
}

export function hackCss(attr: string, value: string) {
  const prefix: string[] = ['webkit', 'Moz', 'ms', 'OT'];

  const styleObj: any = {};
  prefix.forEach((item) => {
    styleObj[`${item}${upperFirst(attr)}`] = value;
  });
  return {
    ...styleObj,
    [attr]: value,
  };
}

/* istanbul ignore next */
export function on(
  element: Element | HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
): void {
  if (element && event && handler) {
    element.addEventListener(event, handler, false);
  }
}

/* istanbul ignore next */
export function off(
  element: Element | HTMLElement | Document | Window,
  event: string,
  handler: Fn,
): void {
  if (element && event && handler) {
    element.removeEventListener(event, handler, false);
  }
}

/* istanbul ignore next */
export function once(el: HTMLElement, event: string, fn: EventListener): void {
  const listener = function (this: any, ...args: unknown[]) {
    if (fn) {
      fn.apply(this, args);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
}

export function useRafThrottle<T extends FunctionArgs>(fn: T): T {
  let locked = false;
  // @ts-ignore
  return function (...args: any[]) {
    if (locked) return;
    locked = true;
    window.requestAnimationFrame(() => {
      // @ts-ignore
      fn.apply(this, args);
      locked = false;
    });
  };
}

export enum fileType {
  BLOB = 'blob',
  FILE = 'file',
}

export interface dom2imgFileParams {
  dom: HTMLElement;
  fileName?: string;
  type: fileType | 'base64';
  scale?: number;
}

// DOM截图生成文件对象
export async function dom2imgFile<T extends File | Blob | string>({
  dom,
  fileName,
  type,
  scale,
}: dom2imgFileParams) {
  if (scale === undefined) {
    scale = 1;
  }
  scale *= window.devicePixelRatio;
  const width = dom.offsetWidth;
  const height = dom.offsetHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.getContext('2d')!.scale(scale, scale);
  const canvasRes: HTMLCanvasElement = await html2canvas(dom, {
    canvas,
    width,
    height,
    useCORS: true,
  });
  canvasRes.getContext('2d')!.imageSmoothingEnabled = false;
  const obj = {
    blob: dataURLtoBlob(canvasRes.toDataURL('image/jpeg', 1.0)),
    file: dataURLtoFile(canvasRes.toDataURL('image/jpeg', 1.0), fileName!),
    dataURL: canvasRes.toDataURL('image/jpeg', 1.0),
  };
  return obj[type] as Promise<T>;
}

export function setRem() {
  const baseSize = 16; // 32
  function setRem() {
    const scale = screen.width / 1920;
    document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px';
  }
  const handler = useDebounceFn(setRem, 800);
  window.onresize = function () {
    handler();
  };
}

export function getRem(): number {
  return Number(getComputedStyle(document.body, null).getPropertyValue('font-size').slice(0, -2));
}

interface coordinateInfo {
  x: number;
  y: number;
}

export function checkInDOM(target: HTMLElement, dom: HTMLElement | coordinateInfo) {
  const { top, bottom, left, right } = target.getBoundingClientRect();
  if (Reflect.has(dom, 'x') && Reflect.has(dom, 'y')) {
    const x = (dom as coordinateInfo).x,
      y = (dom as coordinateInfo).y;
    return left < x && x < right && top < y && y < bottom;
  } else if (dom instanceof HTMLElement) {
    const { top: top2, bottom: bottom2, left: left2, right: right2 } = dom.getBoundingClientRect();
    return left < left2 && right2 < right && top2 < bottom && top < bottom2;
  }
}

type domCallbackType = (ele: Element) => void;

export function domForeach(doms: HTMLCollectionOf<Element>, callback: domCallbackType) {
  const arr = Array.from(doms);
  arr.forEach((element) => {
    callback(element);
  });
}
