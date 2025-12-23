export function isObject<
  T extends Record<string, unknown> = Record<string, unknown>,
>(value: unknown): value is T {
  const type = typeof value;

  return Boolean(value) && (type === "object" || type === "function");
}
