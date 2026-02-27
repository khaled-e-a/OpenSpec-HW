import type { WidgetDefinition } from '../types/layout'
import { registry } from './widgetRegistry'

export function registerWidget(definition: WidgetDefinition): void {
  registry.set(definition.id, definition)
}
