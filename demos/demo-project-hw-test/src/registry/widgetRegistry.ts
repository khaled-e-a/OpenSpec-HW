import type { WidgetDefinition } from '../types/layout'

const registry = new Map<string, WidgetDefinition>()

export function getWidget(id: string): WidgetDefinition | undefined {
  return registry.get(id)
}

export function getAllWidgets(): WidgetDefinition[] {
  return Array.from(registry.values())
}

export { registry }
