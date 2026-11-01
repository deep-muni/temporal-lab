export function processDocument(documentId: string): Promise<string> {
  return Promise.resolve(`Received document ${documentId}`);
}
