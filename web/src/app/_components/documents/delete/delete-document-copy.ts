export const DELETE_DIALOG_COPY = {
  title: 'Delete document?',
  description: (name: string) =>
    `${name} and everything stored to search it will be removed. This cannot be undone.`,
  confirm: 'Delete',
  deleting: 'Deleting',
  cancel: 'Cancel',
  close: 'Close',
  failed: 'The document could not be deleted. Please try again.',
  action: (name: string) => `Delete ${name}`,
} as const;
