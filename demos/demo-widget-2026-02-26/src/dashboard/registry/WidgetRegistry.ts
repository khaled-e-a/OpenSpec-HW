import type { RegistryEntry } from '../types';
import { RegistrationError } from './RegistrationError';

const store = new Map<string, RegistryEntry>();

function isValidComponent(c: unknown): boolean {
  return typeof c === 'function';
}

const WidgetRegistry = {
  register(key: string, entry: RegistryEntry): void {
    if (typeof key !== 'string' || key.trim() === '') {
      throw new RegistrationError(
        `Widget type key must be a non-empty string, got: ${JSON.stringify(key)}`,
      );
    }
    if (!isValidComponent(entry.component)) {
      throw new RegistrationError(
        `entry.component must be a valid React component for key "${key}"`,
      );
    }
    if (typeof entry.displayName !== 'string' || entry.displayName.trim() === '') {
      throw new RegistrationError(
        `entry.displayName must be a non-empty string for key "${key}"`,
      );
    }
    const { w, h } = entry.defaultSize;
    if (!Number.isInteger(w) || w < 1 || !Number.isInteger(h) || h < 1) {
      throw new RegistrationError(
        `entry.defaultSize must have positive integer w and h for key "${key}"`,
      );
    }
    if (store.has(key)) {
      throw new RegistrationError(`Widget type '${key}' is already registered`);
    }
    store.set(key, entry);
  },

  get(key: string): RegistryEntry | undefined {
    return store.get(key);
  },

  list(): RegistryEntry[] {
    return Array.from(store.values());
  },

  /** Returns all registered entries with their keys. */
  entries(): Array<{ key: string; entry: RegistryEntry }> {
    return Array.from(store.entries()).map(([key, entry]) => ({ key, entry }));
  },

  /** For test environments only — clears all registrations. */
  __reset(): void {
    store.clear();
  },
};

export { WidgetRegistry };
