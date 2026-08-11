"use client";

import { useEffect } from "react";

const LOG_ENDPOINT = "/api/dev/frontend-log";
const MAX_ARG_LENGTH = 3000;

export default function FrontendLogBridge() {
  useEffect(() => {
    if (!shouldEnableFrontendLogs() || window.__clinicFrontendLogBridgeInstalled) return;

    window.__clinicFrontendLogBridgeInstalled = true;
    const originalConsole = {
      error: console.error.bind(console),
      warn: console.warn.bind(console),
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      sendFrontendLog("error", args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      sendFrontendLog("warn", args);
    };

    const onError = (event) => {
      sendFrontendLog("error", [
        "window.error",
        serializeErrorLike(event.error) || event.message,
        event.filename,
        event.lineno,
        event.colno,
      ]);
    };

    const onUnhandledRejection = (event) => {
      sendFrontendLog("error", ["unhandledrejection", serializeErrorLike(event.reason) || event.reason]);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}

export function sendFrontendLog(level, args) {
  if (typeof window === "undefined" || !shouldEnableFrontendLogs()) return;

  const body = JSON.stringify({
    entries: [
      {
        level,
        timestamp: new Date().toISOString(),
        path: `${window.location.pathname || "/"}${window.location.search || ""}`,
        args: normalizeArgs(args),
      },
    ],
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(LOG_ENDPOINT, blob)) return;
    }
  } catch {}

  fetch(LOG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function shouldEnableFrontendLogs() {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_FRONTEND_LOGS === "1";
}

function normalizeArgs(args) {
  return (Array.isArray(args) ? args : [args]).map((arg) => {
    const value = serializeErrorLike(arg) || arg;
    if (typeof value === "string") return truncate(value);
    try {
      return JSON.parse(truncate(JSON.stringify(value, replacer)));
    } catch {
      return truncate(String(value));
    }
  });
}

function serializeErrorLike(value) {
  if (!value || typeof value !== "object") return null;
  if (value instanceof Error || value.name || value.message || value.stack) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      status: value.status,
      info: value.info,
    };
  }
  return null;
}

function replacer(key, value) {
  if (/authorization|token|secret|password/i.test(key)) return "[redacted]";
  if (value instanceof Error) return serializeErrorLike(value);
  if (typeof value === "string") return truncate(value);
  return value;
}

function truncate(value) {
  const text = String(value ?? "");
  return text.length > MAX_ARG_LENGTH ? `${text.slice(0, MAX_ARG_LENGTH)}...` : text;
}
