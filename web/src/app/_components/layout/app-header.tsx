import { BRAND_PALETTE } from '@/theme/brand';
import { Box, Center, Container, HStack, Stack, Text } from '@chakra-ui/react';
import { LuWorkflow } from 'react-icons/lu';
import { ColorModeToggle } from '../color-mode/color-mode-toggle';
import { APP_COPY } from './app-copy';

export function AppHeader() {
  return (
    <Box as="header" bg="bg" borderBottomWidth="1px" data-testid="app-header">
      <Container maxW="5xl" py="3">
        <HStack justify="space-between">
          <HStack gap="3">
            <Center
              boxSize="9"
              rounded="lg"
              colorPalette={BRAND_PALETTE}
              bg="colorPalette.solid"
              color="colorPalette.contrast"
              aria-hidden
            >
              <LuWorkflow />
            </Center>
            <Stack gap="0">
              <Text fontWeight="semibold" textStyle="sm">
                {APP_COPY.name}
              </Text>
              <Text textStyle="xs" color="fg.muted">
                {APP_COPY.tagline}
              </Text>
            </Stack>
          </HStack>
          <ColorModeToggle />
        </HStack>
      </Container>
    </Box>
  );
}
