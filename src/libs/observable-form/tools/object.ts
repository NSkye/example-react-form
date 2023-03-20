/**
 * This function returns deep copy of the object.
 * Event if the object contains Map or Set, it will be copied as well.
 */
export const deepCopy = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object' || typeof obj === 'function') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepCopy) as T;
  }

  if (obj instanceof Map) {
    return new Map(
      Array.from(obj.entries()).map(([key, value]) => [deepCopy(key), deepCopy(value)]),
    ) as T;
  }

  if (obj instanceof Set) {
    return new Set(Array.from(obj.values()).map(deepCopy)) as T;
  }

  return Object.keys(obj).reduce(
    (acc, key) => ({ ...acc, [key]: deepCopy(obj[key as keyof T]) }),
    {} as T,
  );
};
