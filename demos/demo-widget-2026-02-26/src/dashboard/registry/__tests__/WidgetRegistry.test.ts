import { describe, it, expect, beforeEach } from 'vitest';
import { WidgetRegistry } from '../WidgetRegistry';
import { RegistrationError } from '../RegistrationError';
import type { WidgetProps } from '../../types';

function MockWidget(_props: WidgetProps) { return null; }

const validEntry = {
  component: MockWidget,
  displayName: 'Mock Widget',
  defaultSize: { w: 2, h: 2 },
};

beforeEach(() => {
  WidgetRegistry.__reset();
});

describe('WidgetRegistry.register', () => {
  it('registers a valid widget type', () => {
    WidgetRegistry.register('mock', validEntry);
    expect(WidgetRegistry.get('mock')).toBe(validEntry);
  });

  it('throws RegistrationError for duplicate key', () => {
    WidgetRegistry.register('mock', validEntry);
    expect(() => WidgetRegistry.register('mock', validEntry))
      .toThrow(RegistrationError);
  });

  it('throws RegistrationError for empty key', () => {
    expect(() => WidgetRegistry.register('', validEntry)).toThrow(RegistrationError);
  });

  it('throws RegistrationError for non-string key', () => {
    expect(() => WidgetRegistry.register(null as unknown as string, validEntry))
      .toThrow(RegistrationError);
  });

  it('throws RegistrationError for invalid component', () => {
    expect(() =>
      WidgetRegistry.register('bad', { ...validEntry, component: 'not-a-component' as unknown as typeof MockWidget })
    ).toThrow(RegistrationError);
  });

  it('throws RegistrationError for non-positive defaultSize w', () => {
    expect(() =>
      WidgetRegistry.register('bad', { ...validEntry, defaultSize: { w: 0, h: 2 } })
    ).toThrow(RegistrationError);
  });

  it('throws RegistrationError for non-positive defaultSize h', () => {
    expect(() =>
      WidgetRegistry.register('bad', { ...validEntry, defaultSize: { w: 2, h: -1 } })
    ).toThrow(RegistrationError);
  });
});

describe('WidgetRegistry.get', () => {
  it('returns registered entry', () => {
    WidgetRegistry.register('mock', validEntry);
    expect(WidgetRegistry.get('mock')).toBe(validEntry);
  });

  it('returns undefined for unknown key', () => {
    expect(WidgetRegistry.get('unknown')).toBeUndefined();
  });
});
