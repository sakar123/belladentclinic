export function Button({ children, ...props }) {
    return (
      <button
        {...props}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded"
      >
        {children}
      </button>
    )
  }
  