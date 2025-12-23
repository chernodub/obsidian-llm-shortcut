import { getObjectKeys } from "../get-object-keys";
import { isObject } from "../is-object/is-object";

/**
 * Код взят отсюда https://gist.github.com/egardner/efd34f270cc33db67c0246e837689cb9
 *
 * Функция подходит только для сравнения объектов и массивов любой вложенности с примитивами внутри
 *
 * Не подходит для сравнения сложных объектов типа Date, Function, RegExp и т.п.
 * Воспринимает их как простые объекты и сравнивает собственные перечисляемые свойства
 *
 * Выдает false при сравнении двух NaN
 */
export function deepEqual<T>(actual: unknown, expected: T): actual is T {
  if (actual === expected) {
    return true;
  }

  if (!isObject(actual) || !isObject(expected)) {
    return false;
  }

  if (Array.isArray(actual) !== Array.isArray(expected)) {
    return false;
  }

  const actualKeys = getObjectKeys(actual);
  const expectedKeys = getObjectKeys(expected);

  if (actualKeys.length !== expectedKeys.length) {
    return false;
  }

  for (const key of expectedKeys) {
    if (!((key as string) in actual)) {
      return false;
    }

    if (!deepEqual((actual as T)[key as keyof T], expected[key])) {
      return false;
    }
  }

  return true;
}
