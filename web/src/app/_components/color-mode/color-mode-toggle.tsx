'use client';

import { ColorModeIcon, useColorMode } from '@/components/ui/color-mode';
import { Tooltip } from '@/components/ui/tooltip';
import { ClientOnly, IconButton, Skeleton } from '@chakra-ui/react';
import { COLOR_MODE_COPY } from './color-mode-copy';

export function ColorModeToggle() {
  return (
    <ClientOnly fallback={<Skeleton boxSize="9" rounded="md" />}>
      <ColorModeToggleButton />
    </ClientOnly>
  );
}

function ColorModeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  const label =
    colorMode === 'dark'
      ? COLOR_MODE_COPY.switchToLight
      : COLOR_MODE_COPY.switchToDark;

  return (
    <Tooltip content={label} showArrow openDelay={200}>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={label}
        onClick={toggleColorMode}
        data-testid="app-color-mode-toggle"
      >
        <ColorModeIcon />
      </IconButton>
    </Tooltip>
  );
}
