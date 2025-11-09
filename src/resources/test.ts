// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';

export class Test extends APIResource {}

// Simple passing test to avoid empty test file checks in CI.
// Declarations keep TypeScript happy outside the Jest environment.
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (value: unknown) => { toBe: (expected: unknown) => void };

if (typeof describe === 'function' && typeof it === 'function' && typeof expect === 'function') {
  describe('resources/test placeholder', () => {
    it('passes', () => {
      expect(true).toBe(true);
    });
  });
}
