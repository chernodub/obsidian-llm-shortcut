export function assertExists<T>(
  value: T | undefined | null,
  message: string,
): asserts value is T {
  if (!value) {
    throw new Error(message);
  }
}
