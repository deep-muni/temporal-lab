import { Center, Icon } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { LuFileCode, LuFileText } from 'react-icons/lu';
import { DOCUMENTS_COPY } from './documents-copy';

interface FileKind {
  icon: IconType;
  label: string;
  colorPalette: string;
}

const MARKDOWN: FileKind = {
  icon: LuFileCode,
  label: DOCUMENTS_COPY.fileTypes.markdown,
  colorPalette: 'purple',
};

const PLAIN_TEXT: FileKind = {
  icon: LuFileText,
  label: DOCUMENTS_COPY.fileTypes.plainText,
  colorPalette: 'gray',
};

export function fileKindOf(name: string): FileKind {
  return name.toLowerCase().endsWith('.md') ? MARKDOWN : PLAIN_TEXT;
}

export function DocumentFileIcon({ name }: { name: string }) {
  const kind = fileKindOf(name);
  return (
    <Center
      boxSize="9"
      rounded="md"
      flexShrink={0}
      colorPalette={kind.colorPalette}
      bg="colorPalette.subtle"
      color="colorPalette.fg"
      aria-hidden
    >
      <Icon as={kind.icon} boxSize="4.5" />
    </Center>
  );
}
