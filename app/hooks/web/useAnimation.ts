import { useTimeoutFn } from '../core/useTimeout';
import { checkInDOM } from '@dq-next/utils/domUtils';

interface animationLifeCycle {
  before: Nullable<Fn> | undefined;
  after: Nullable<Fn> | undefined;
}

interface dragLifeCycle {
  dragStart: Nullable<Fn> | undefined;
  drag: Nullable<Fn> | undefined;
  dragEnd: Nullable<Fn> | undefined;
}

type pointerSlideInHooks = [
  HTMLElement,
  { setBeforeAnimate: Fn; setAfterAnimate: Fn; initAnimation: Fn },
];

export function usePointerSlideIn(dom: HTMLElement, event: MouseEvent): pointerSlideInHooks {
  const fnObj: animationLifeCycle = {
    before: null,
    after: null,
  };

  function setBeforeAnimate(fn: Fn) {
    fnObj.before = fn;
  }

  function setAfterAnimate(fn: Fn) {
    fnObj.after = fn;
  }

  const cloneDom = dom.cloneNode(true) as HTMLElement;

  function animateNow() {
    dom.style.opacity = '0';
    const { left, top, width, height } = dom.getBoundingClientRect();

    const style = cloneDom.style;
    style.width = width + 'px';
    style.position = 'fixed';
    style.top = event.pageY - height / 2 + 'px';
    style.left = event.pageX - width / 2 + 'px';
    style.zIndex = '99';
    style.transform = 'scale(.05)';
    style.transition = '.3s ease-out';
    style.transitionProperty = 'transform left top';
    style.opacity = '1';
    document.body.appendChild(cloneDom);
    requestAnimationFrame(() => {
      cloneDom.style.transform = 'scale(1)';
      cloneDom.style.top = top + 'px';
      cloneDom.style.left = left + 'px';
    });
    useTimeoutFn(() => {
      cloneDom.remove();
      dom.style.removeProperty('opacity');
    }, 320);
  }

  function initAnimation() {
    fnObj.before && fnObj.before(dom, event);
    animateNow();
    fnObj.after && fnObj.after(dom, event);
  }

  return [cloneDom, { setBeforeAnimate, setAfterAnimate, initAnimation }];
}

export function useDropRemove(boxdom: HTMLElement, rubbish: HTMLElement) {
  let moveout = false;
  let ghostDom: Nullable<HTMLElement> = null;
  let removeFn: Fn;

  const fnObj: dragLifeCycle = {
    dragStart: null,
    drag: null,
    dragEnd: null,
  };

  function setDragStart(fn: Fn) {
    fnObj.dragStart = fn;
  }

  function setDragEnd(fn: Fn) {
    fnObj.dragEnd = fn;
  }

  function setDrag(fn: Fn) {
    fnObj.drag = fn;
  }

  function setRemoveFn(fn: Fn) {
    removeFn = fn;
  }

  function dragListener(event: DragEvent) {
    fnObj.drag && fnObj.drag(event);
    const { x, y } = event;
    const style = ghostDom!.style;
    style.left = `${x}px`;
    style.top = `${y}px`;

    if (!checkInDOM(boxdom, { x, y })) {
      if (moveout) return;
      moveout = true;
      style.transform = 'scale(.2)';
    } else {
      style.transform = 'scale(1.2)';
      moveout = false;
    }
  }

  function dragStartListener(event: DragEvent) {
    fnObj.dragStart && fnObj.dragStart(event);
    const { x, y, target } = event;
    ghostDom = (target as HTMLElement).cloneNode(true) as HTMLElement;
    const style = ghostDom.style;
    style.position = 'absolute';
    style.opacity = '0.75';
    style.transform = 'scale(1.2)';
    style.transition = 'transform 0.3s ease-out';
    style.transformOrigin = 'left top';
    style.left = `${x}px`;
    style.top = `${y}px`;
    document.body.appendChild(ghostDom);
  }

  function dragEndListener(event: DragEvent) {
    fnObj.dragEnd && fnObj.dragEnd(event);
    ghostDom!.remove();
    moveout = false;
  }

  function rubbishMouseUpListener(event: MouseEvent) {
    console.log(event);
    removeFn && removeFn(event);
  }

  function rubbishDragOverListener() {}

  function initDropRemove() {
    boxdom.addEventListener('dragstart', dragStartListener);
    boxdom.addEventListener('drag', dragListener);
    boxdom.addEventListener('dragend', dragEndListener);
    rubbish.addEventListener('mouseup', rubbishMouseUpListener, false);
    rubbish.addEventListener('dragover', rubbishDragOverListener, false);
  }

  return {
    setDragStart,
    setDrag,
    setDragEnd,
    setRemoveFn,
    initDropRemove,
  };
}
