import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function keysToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/([-_][a-z])/g, g => g.toUpperCase().replace(/[-_]/g, ''))]: keysToCamel(
          obj[key]
        ),
      }),
      {}
    );
  }
  return obj;
}

export function keysToSnake(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToSnake(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)]: keysToSnake(
          obj[key]
        ),
      }),
      {}
    );
  }
  return obj;
}
