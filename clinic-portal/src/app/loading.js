export default function Loading() {
  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="absolute inset-0 grid place-items-center p-6">
        <div className="w-full max-w-xs rounded-2xl border border-white/40 bg-gradient-to-br from-teal-600 to-sky-500 text-white shadow-2xl">
          <div className="px-6 pt-6 pb-3 text-center">
            <div className="text-lg font-semibold">Loading…</div>
            <div className="text-xs/relaxed opacity-90">Please hold on</div>
          </div>
          <div className="px-6 pb-6 flex items-center justify-center">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/30" />
              <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" style={{ animationDuration: '900ms' }} />
              <div className="absolute inset-0 rounded-full border-2 border-white/60 border-t-transparent animate-spin" style={{ animationDuration: '1400ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
