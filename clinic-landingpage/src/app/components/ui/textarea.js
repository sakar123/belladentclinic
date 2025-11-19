export function Textarea({ ...props }) {
    return (
      <textarea
        {...props}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    )
  }
  