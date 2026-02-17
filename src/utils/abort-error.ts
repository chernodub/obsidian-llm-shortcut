export class AbortError extends Error {
  override name = "AbortError";

  public constructor() {
    super("The operation was aborted");
  }
}
