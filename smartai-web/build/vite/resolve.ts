import path from 'node:path';
import type { ResolveOptions } from 'vite';

export default {
  alias: {
    '@': path.resolve(import.meta.dirname, '../../src'),
  },
} as ResolveOptions;
