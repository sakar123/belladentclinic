const CHUNK_RELOAD_SCRIPT = `
(function () {
  var reloadKey = "clinic-portal:chunk-reload-state";
  var retryParam = "__chunkRetry";
  var retryThrottleMs = 1000;
  var retryStateMaxAgeMs = 60000;
  var maxRetries = 3;

  if (window.__clinicChunkReloadGuardInstalled) return;
  window.__clinicChunkReloadGuardInstalled = true;

  function textFrom(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return [
      value.name,
      value.message,
      value.stack,
      value.filename,
      value.type,
      value.src,
      value.currentSrc,
      value.href,
      value.url
    ].filter(Boolean).join(" ");
  }

  function isNextChunkUrl(value) {
    return /_next\\/static\\/(chunks|css)\\//i.test(String(value || ""));
  }

  function isChunkLoadFailure(event) {
    var target = event && (event.reason || event.error || event.target || event);
    var message = textFrom(target);
    return /ChunkLoadError|Loading chunk \\d+ failed|Loading CSS chunk \\d+ failed/i.test(message)
      || isNextChunkUrl(message);
  }

  function reloadWithFreshUrl() {
    try {
      var now = Date.now();
      var state = {};

      try {
        state = JSON.parse(window.sessionStorage.getItem(reloadKey) || "{}") || {};
      } catch (error) {
        state = {};
      }

      if (!state.firstAt || now - Number(state.firstAt) > retryStateMaxAgeMs) {
        state = { firstAt: now, lastAt: 0, count: 0 };
      }

      if (now - Number(state.lastAt || 0) < retryThrottleMs) return;
      if (Number(state.count || 0) >= maxRetries) return;

      state.lastAt = now;
      state.count = Number(state.count || 0) + 1;
      window.sessionStorage.setItem(reloadKey, JSON.stringify(state));

      var url = new URL(window.location.href);
      url.searchParams.set(retryParam, String(now) + "-" + state.count);
      window.location.replace(url.toString());
    } catch (error) {
      window.location.reload();
    }
  }

  try {
    var cleanUrl = new URL(window.location.href);
    if (cleanUrl.searchParams.has(retryParam)) {
      cleanUrl.searchParams.delete(retryParam);
      window.history.replaceState(window.history.state, "", cleanUrl.toString());
    }
  } catch (error) {}

  window.setTimeout(function () {
    try {
      window.sessionStorage.removeItem(reloadKey);
    } catch (error) {}
  }, 10000);

  window.addEventListener("error", function (event) {
    if (isChunkLoadFailure(event)) {
      if (event.preventDefault) event.preventDefault();
      reloadWithFreshUrl();
    }
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    if (isChunkLoadFailure(event)) {
      if (event.preventDefault) event.preventDefault();
      reloadWithFreshUrl();
    }
  });

  if (window.fetch) {
    var originalFetch = window.fetch.bind(window);
    window.fetch = function () {
      var requestUrl = arguments[0] && (arguments[0].url || arguments[0]);
      return originalFetch.apply(window, arguments).then(function (response) {
        if (response && !response.ok && isNextChunkUrl(response.url || requestUrl)) {
          reloadWithFreshUrl();
        }
        return response;
      }).catch(function (error) {
        if (isNextChunkUrl(requestUrl) || isChunkLoadFailure(error)) {
          reloadWithFreshUrl();
        }
        throw error;
      });
    };
  }
})();
`;

export default function ChunkReloadScript() {
  return (
    <script
      id="clinic-chunk-reload-guard"
      dangerouslySetInnerHTML={{ __html: CHUNK_RELOAD_SCRIPT }}
    />
  );
}
