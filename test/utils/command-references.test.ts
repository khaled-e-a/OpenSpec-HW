import { describe, it, expect } from 'vitest';
import { transformToHyphenCommands } from '../../src/utils/command-references.js';

describe('transformToHyphenCommands', () => {
  describe('basic transformations', () => {
    it('should transform single command reference', () => {
      expect(transformToHyphenCommands('/synspec:new')).toBe('/synspec-new');
    });

    it('should transform multiple command references', () => {
      const input = '/synspec:new and /synspec:apply';
      const expected = '/synspec-new and /synspec-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should transform command reference in context', () => {
      const input = 'Use /synspec:apply to implement tasks';
      const expected = 'Use /synspec-apply to implement tasks';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/synspec:continue` to proceed';
      const expected = 'Run `/synspec-continue` to proceed';
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
      const input = '/synspec:new /synspec:continue /synspec:apply';
      const expected = '/synspec-new /synspec-continue /synspec-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('multiline content', () => {
    it('should transform references across multiple lines', () => {
      const input = `Use /synspec:new to start
Then /synspec:continue to proceed
Finally /synspec:apply to implement`;
      const expected = `Use /synspec-new to start
Then /synspec-continue to proceed
Finally /synspec-apply to implement`;
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
      it(`should transform /synspec:${cmd}`, () => {
        expect(transformToHyphenCommands(`/synspec:${cmd}`)).toBe(`/synspec-${cmd}`);
      });
    }
  });
});
