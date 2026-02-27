import '@testing-library/jest-dom'

// Pointer capture is not implemented in jsdom
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()

// PointerEvent constructor is not available in all jsdom versions
if (typeof PointerEvent === 'undefined') {
  global.PointerEvent = class PointerEvent extends MouseEvent {
    pointerId
    pointerType
    constructor(type, init = {}) {
      super(type, init)
      this.pointerId = init.pointerId ?? 0
      this.pointerType = init.pointerType ?? 'mouse'
    }
  }
}

// ResizeObserver is not implemented in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Suppress React error boundary console.error noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Error boundaries') ||
        args[0].includes('The above error occurred'))
    )
      return
    originalError(...args)
  }
})
afterAll(() => {
  console.error = originalError
})
