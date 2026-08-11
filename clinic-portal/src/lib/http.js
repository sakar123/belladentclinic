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

function toPlainHeaders(headers) {
  if (!headers) return {};
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers;
}

function hasAuthorizationHeader(headers) {
  return Object.keys(toPlainHeaders(headers)).some((key) => key.toLowerCase() === "authorization");
}

async function getAuthHeaders(options) {
  if (!_getToken) return {};
  try {
    const token = await _getToken(options);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth token lookup failed", {
        name: error?.name,
        message: error?.message,
        error,
      });
    }
    return {};
  }
}

async function fetchWithAuth(input, init = {}) {
  const callerHeaders = toPlainHeaders(init.headers);
  const authHeaders = await getAuthHeaders();
  const mergedHeaders = { ...authHeaders, ...callerHeaders };
  const response = await fetch(input, { ...init, headers: mergedHeaders });

  if (response.status !== 401 || !_getToken || hasAuthorizationHeader(callerHeaders)) {
    return response;
  }

  const freshAuthHeaders = await getAuthHeaders({ cacheMode: "off" });
  if (!freshAuthHeaders.Authorization || freshAuthHeaders.Authorization === authHeaders.Authorization) {
    return response;
  }

  return fetch(input, {
    ...init,
    headers: { ...freshAuthHeaders, ...callerHeaders },
  });
}

export async function authFetch(input, init = {}) {
  return fetchWithAuth(input, init);
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
  const mergedHeaders = { ...DEFAULT_HEADERS, ...toPlainHeaders(headers) };

  if (isAbsoluteUrl(baseUrl)) {
    const url = new URL(baseUrl + path);
    if (params) Object.entries(keysToSnake(params)).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetchWithAuth(url.toString(), { method: "GET", headers: mergedHeaders, cache: "no-store" });
    return handleResponse(res);
  }
  const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL(origin);
  url.pathname = (baseUrl || "") + path;
  if (params) Object.entries(keysToSnake(params)).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetchWithAuth(url.pathname + url.search, { method: "GET", headers: mergedHeaders, cache: "no-store" });
  return handleResponse(res);
}

export async function post(path, body, { headers } = {}) {
  const target = isAbsoluteUrl(baseUrl) ? baseUrl + path : (baseUrl || "") + path;
  const res = await fetchWithAuth(target, { method: "POST", headers: { ...DEFAULT_HEADERS, ...toPlainHeaders(headers) }, body: JSON.stringify(keysToSnake(body || {})) });
  return handleResponse(res);
}

export async function put(path, body, { headers } = {}) {
  const target = isAbsoluteUrl(baseUrl) ? baseUrl + path : (baseUrl || "") + path;
  const res = await fetchWithAuth(target, { method: "PUT", headers: { ...DEFAULT_HEADERS, ...toPlainHeaders(headers) }, body: JSON.stringify(keysToSnake(body || {})) });
  return handleResponse(res);
}

export async function del(path, { headers } = {}) {
  const target = isAbsoluteUrl(baseUrl) ? baseUrl + path : (baseUrl || "") + path;
  const res = await fetchWithAuth(target, { method: "DELETE", headers: { ...DEFAULT_HEADERS, ...toPlainHeaders(headers) } });
  return handleResponse(res);
}

export const http = { get, post, put, del };
