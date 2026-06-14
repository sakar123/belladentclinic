"use client";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
      <div className="text-4xl font-semibold">Something went wrong</div>
      <p className="text-app-muted mt-2 max-w-md break-all">
        {String(error?.message || 'Unexpected error')}
      </p>
      <button
        className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white hover:opacity-90"
        onClick={() => reset?.()}
      >
        Try again
      </button>
    </div>
  );
}

