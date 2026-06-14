import { keysToCamel, keysToSnake } from "./utils";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // same origin by default

// Token getter — set by AuthContext once authenticated
let _getToken = null;

export function setTokenGetter(fn) {
  _getToken = fn;
}

async function getAuthHeaders() {
  if (!_getToken) return {};
  try {
    const token = await _getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function authFetch(input, init = {}) {
  const authHeaders = await getAuthHeaders();
  const mergedHeaders = { ...authHeaders, ...(init.headers || {}) };
  return fetch(input, { ...init, headers: mergedHeaders });
}

function isAbsoluteUrl(u) {
  return /^https?:\/\//i.test(u || "");
}

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    let message = res.statusText;
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => undefined);
      if (data) message = JSON.stringify(data);
    } else {
      const text = await res.text().catch(() => undefined);
      if (text) message = text;
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return keysToCamel(data);
  }
  return res.text();
}

export async function get(path, { params, headers } = {}) {
  const authHeaders = await getAuthHeaders();
  const mergedHeaders = { ...DEFAULT_HEADERS, ...authHeaders, ...(headers || {}) };

  if (isAbsoluteUrl(baseUrl)) {
    const url = new URL(baseUrl + path);
    if (params) Object.entries(keysToSnake(params)).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { method: "GET", headers: mergedHeaders, cache: "no-store" });
    return handleResponse(res);
  }
  const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL(origin);
  url.pathname = (baseUrl || "") + path;
  if (params) Object.entries(keysToSnake(params)).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.pathname + url.search, { method: "GET", headers: mergedHeaders, cache: "no-store" });
  return handleResponse(res);
}

export async function post(path, body, { headers } = {}) {
  const authHeaders = await getAuthHeaders();
  const target = isAbsoluteUrl(baseUrl) ? baseUrl + path : (baseUrl || "") + path;
  const res = await fetch(target, { method: "POST", headers: { ...DEFAULT_HEADERS, ...authHeaders, ...(headers || {}) }, body: JSON.stringify(keysToSnake(body || {})) });
  return handleResponse(res);
}

export async function put(path, body, { headers } = {}) {
  const authHeaders = await getAuthHeaders();
  const target = isAbsoluteUrl(baseUrl) ? baseUrl + path : (baseUrl || "") + path;
  const res = await fetch(target, { method: "PUT", headers: { ...DEFAULT_HEADERS, ...authHeaders, ...(headers || {}) }, body: JSON.stringify(keysToSnake(body || {})) });
  return handleResponse(res);
}

export async function del(path, { headers } = {}) {
  const authHeaders = await getAuthHeaders();
  const target = isAbsoluteUrl(baseUrl) ? baseUrl + path : (baseUrl || "") + path;
  const res = await fetch(target, { method: "DELETE", headers: { ...DEFAULT_HEADERS, ...authHeaders, ...(headers || {}) } });
  return handleResponse(res);
}

export const http = { get, post, put, del };
