import Link from 'next/link';

export default function Fab() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2">
      <Link
        href="/appointments/new"
        className="rounded-full px-4 py-2 bg-sky-600 text-white shadow-lg hover:opacity-90"
        aria-label="Schedule appointment"
      >
        + Appointment
      </Link>
      <Link
        href="/patients/new"
        className="rounded-full px-4 py-2 bg-teal-600 text-white shadow-lg hover:opacity-90"
        aria-label="Add patient"
      >
        + Patient
      </Link>
    </div>
  );
}

