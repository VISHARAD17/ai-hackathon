"use client";

interface FormField {
  name: string;
  type: "text" | "select" | "radio" | "date" | "textarea";
  value: string;
  options?: string[];
}

interface ClaimFormProps {
  claimType?: string;
  date?: string;
  location?: string;
  description?: string;
  fields?: FormField[];
  loading?: boolean;
}

export function ClaimForm({
  claimType = "Auto Collision",
  date = "",
  location = "",
  description = "",
  fields = [],
  loading = false,
}: ClaimFormProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">📝</span> New Claim
      </h3>
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Generating form...
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Claim Type
          </label>
          <input
            type="text"
            value={claimType}
            readOnly
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Date
          </label>
          <input
            type="text"
            value={date}
            readOnly
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            readOnly
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Description
          </label>
          <textarea
            value={description}
            readOnly
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50 h-20 resize-none"
          />
        </div>

        {fields.map((field, idx) => (
          <div key={idx}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {field.name}
            </label>
            {field.type === "select" && field.options ? (
              <select
                value={field.value}
                className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={field.value}
                readOnly
                className="w-full border rounded px-3 py-2 text-sm bg-gray-50 h-16 resize-none"
              />
            ) : field.type === "radio" && field.options ? (
              <div className="flex gap-4">
                {field.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name={`field-${idx}`}
                      value={opt}
                      checked={field.value === opt}
                      readOnly
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type={field.type === "date" ? "date" : "text"}
                value={field.value}
                readOnly
                className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
              />
            )}
          </div>
        ))}

        <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
          Save & Continue →
        </button>
      </div>
    </div>
  );
}
