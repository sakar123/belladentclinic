export function preloadDentalSprites(assetMap) {
  const sources = Object.values(assetMap).filter(Boolean);
  return Promise.all(
    sources.map((src) =>
      new Promise((resolve) => {
        try {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false); // don't block on missing sprites
          img.src = src;
          if (img.decode) {
            img.decode().then(() => resolve(true)).catch(() => resolve(false));
          }
        } catch {
          resolve(false);
        }
      })
    )
  );
}

