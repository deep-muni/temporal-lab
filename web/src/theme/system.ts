import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    '*': {
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    },
    body: { bg: 'bg.subtle', color: 'fg' },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'var(--font-inter), system-ui, sans-serif' },
        body: { value: 'var(--font-inter), system-ui, sans-serif' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
