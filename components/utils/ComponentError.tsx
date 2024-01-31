"use client";

export default function Error() {
  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-3xl font-bold mb-4">Error Loading Data</h1>

      <p className="text-lg text-gray-800 mb-6">
        {"We're sorry, the data you requested could not be found."}
      </p>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  );
}
