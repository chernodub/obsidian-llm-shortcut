/**
 * Type guard for native Object.keys
 */
export function getObjectKeys<Key extends string>(
  object: Record<Key, unknown>,
): Key[] {
  return Object.keys(object) as Key[];
}
