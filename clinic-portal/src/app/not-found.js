export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
      <div className="text-4xl font-semibold">Page not found</div>
      <p className="text-app-muted mt-2 max-w-md">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <a href="/" className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-teal-600 text-white hover:opacity-90">
        Go back home
      </a>
    </div>
  );
}

