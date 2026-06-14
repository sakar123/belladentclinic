"use client";
import { AnimatePresence, motion } from 'framer-motion';
import { useLoadingOverlay } from '@/contexts/LoadingOverlayContext';

export default function LoadingOverlay() {
  const { busy } = useLoadingOverlay();
  return (
    <AnimatePresence>
      {busy && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
          <div className="absolute inset-0 grid place-items-center p-6">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-xs rounded-2xl border border-white/40 bg-gradient-to-br from-teal-600 to-sky-500 text-white shadow-2xl"
            >
              <div className="px-6 pt-6 pb-3 text-center">
                <div className="text-lg font-semibold">Working on it…</div>
                <div className="text-xs/relaxed opacity-90">Please wait a moment</div>
              </div>
              <div className="px-6 pb-6 flex items-center justify-center">
                <Spinner />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Spinner() {
  return (
    <div className="relative h-12 w-12">
      <div className="absolute inset-0 rounded-full border-2 border-white/30" />
      <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" style={{ animationDuration: '900ms' }} />
      <div className="absolute inset-0 rounded-full border-2 border-white/60 border-t-transparent animate-spin" style={{ animationDuration: '1400ms' }} />
    </div>
  );
}

