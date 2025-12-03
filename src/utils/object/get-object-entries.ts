/**
 * Type guard for native Object.entries
 */
export function getObjectEntries<Key extends string, Value>(
  object: Record<Key, Value>,
): [Key, Value][] {
  return Object.entries(object) as [Key, Value][];
}
