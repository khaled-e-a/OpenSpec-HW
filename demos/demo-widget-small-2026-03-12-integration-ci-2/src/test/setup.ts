import '@testing-library/jest-dom';

// jsdom does not implement PointerEvent — polyfill with MouseEvent so
// clientX/clientY are preserved when dispatching pointerup on document.
if (typeof globalThis.PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    public pointerId?: number;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId;
    }
  }
  // @ts-expect-error intentional polyfill
  globalThis.PointerEvent = PointerEvent;
}
