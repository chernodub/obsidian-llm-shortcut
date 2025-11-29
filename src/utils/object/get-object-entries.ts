/**
 * Type guard for getting the entries of an object
 */
export function getObjectEntries<Key extends string, Value>(
  object: Record<Key, Value>,
): [Key, Value][] {
  return Object.entries(object) as [Key, Value][];
}
