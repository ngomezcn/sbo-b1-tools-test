/** Error of our own: stable `code` plus a sentence saying what to do. */
export class SboError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'SboError'
  }
}
