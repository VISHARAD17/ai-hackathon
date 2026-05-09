interface ClaimFormProps {
  claimType?: string;
  date?: string;
  location?: string;
  description?: string;
  loading?: boolean;
}

export function ClaimForm({
  claimType = "Auto Collision",
  date = "",
  location = "",
  description = "",
  loading = false,
}: ClaimFormProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-4">📝 New Claim</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Claim Type</label>
          <input
            type="text"
            value={claimType}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="text"
            value={date}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={location}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            className="w-full border rounded px-3 py-2 h-24"
            disabled={loading}
          />
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save & Continue →
        </button>
      </div>
    </div>
  );
}
