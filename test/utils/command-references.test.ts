import { describe, it, expect } from 'vitest';
import { transformToHyphenCommands } from '../../src/utils/command-references.js';

describe('transformToHyphenCommands', () => {
  describe('basic transformations', () => {
    it('should transform single command reference', () => {
      expect(transformToHyphenCommands('/opsx-hw:new')).toBe('/opsx-hw-new');
    });

    it('should transform multiple command references', () => {
      const input = '/opsx-hw:new and /opsx-hw:apply';
      const expected = '/opsx-hw-new and /opsx-hw-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should transform command reference in context', () => {
      const input = 'Use /opsx-hw:apply to implement tasks';
      const expected = 'Use /opsx-hw-apply to implement tasks';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/opsx-hw:continue` to proceed';
      const expected = 'Run `/opsx-hw-continue` to proceed';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should return unchanged text with no command references', () => {
      const input = 'This is plain text without commands';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(transformToHyphenCommands('')).toBe('');
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new opsx: /other:command';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should handle multiple occurrences on same line', () => {
      const input = '/opsx-hw:new /opsx-hw:continue /opsx-hw:apply';
      const expected = '/opsx-hw-new /opsx-hw-continue /opsx-hw-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('multiline content', () => {
    it('should transform references across multiple lines', () => {
      const input = `Use /opsx-hw:new to start
Then /opsx-hw:continue to proceed
Finally /opsx-hw:apply to implement`;
      const expected = `Use /opsx-hw-new to start
Then /opsx-hw-continue to proceed
Finally /opsx-hw-apply to implement`;
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('all known commands', () => {
    const commands = [
      'new',
      'continue',
      'apply',
      'ff',
      'sync',
      'archive',
      'bulk-archive',
      'verify',
      'explore',
      'onboard',
    ];

    for (const cmd of commands) {
      it(`should transform /opsx-hw:${cmd}`, () => {
        expect(transformToHyphenCommands(`/opsx-hw:${cmd}`)).toBe(`/opsx-hw-${cmd}`);
      });
    }
  });
});
