// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://anarc.cc',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory' },
});
