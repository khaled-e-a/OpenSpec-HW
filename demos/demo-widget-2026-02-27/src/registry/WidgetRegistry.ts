import type { ComponentType } from 'react'

const registry = new Map<string, ComponentType<any>>()

function isReactComponent(value: unknown): value is ComponentType<any> {
  return typeof value === 'function'
}

export function register(typeKey: string, Component: ComponentType<any>): void {
  if (typeof typeKey !== 'string' || typeKey.trim() === '') {
    throw new Error(
      `WidgetRegistry.register: typeKey must be a non-empty string, got ${JSON.stringify(typeKey)}`
    )
  }
  if (!isReactComponent(Component)) {
    throw new Error(
      `WidgetRegistry.register: Component must be a React component (function or class), got ${typeof Component}`
    )
  }
  if (registry.has(typeKey)) {
    console.warn(
      `WidgetRegistry: type key "${typeKey}" is already registered and will be overwritten.`
    )
  }
  registry.set(typeKey, Component)
}

export function resolve(typeKey: string): ComponentType<any> | undefined {
  return registry.get(typeKey)
}

export function clear(): void {
  registry.clear()
}
