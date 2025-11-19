export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Case conversion utilities
const toCamel = (str) =>
  str.replace(/[_-](\w)/g, (_, c) => (c ? c.toUpperCase() : ""));

const toSnake = (str) =>
  str
    .replace(/([A-Z]+)/g, "_$1")
    .replace(/[-\s]+/g, "_")
    .toLowerCase()
    .replace(/^_/, "");

function isObject(val) {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

export function keysToCamel(input) {
  if (Array.isArray(input)) return input.map(keysToCamel);
  if (isObject(input)) {
    const out = {};
    Object.entries(input).forEach(([k, v]) => {
      out[toCamel(k)] = keysToCamel(v);
    });
    return out;
  }
  return input;
}

export function keysToSnake(input) {
  if (Array.isArray(input)) return input.map(keysToSnake);
  if (isObject(input)) {
    const out = {};
    Object.entries(input).forEach(([k, v]) => {
      out[toSnake(k)] = keysToSnake(v);
    });
    return out;
  }
  return input;
}

