export class FileNotFoundError extends Error {
  override readonly name = 'FileNotFoundError';

  constructor(
    readonly container: string,
    readonly fileName: string,
  ) {
    super(`File ${fileName} was not found in ${container}`);
  }
}
