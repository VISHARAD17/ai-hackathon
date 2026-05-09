"use client";

interface DocumentItem {
  name: string;
  status: string;
  source: string;
  action: string;
}

interface ProgressData {
  completed?: number;
  total?: number;
}

interface DocumentChecklistProps {
  items?: DocumentItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress?: any;
  loading?: boolean;
}

export function DocumentChecklist({
  items = [],
  progress = { completed: 0, total: 0 },
  loading = false,
}: DocumentChecklistProps) {
  const completed = progress?.completed ?? 0;
  const total = progress?.total ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">📎</span> Required Documents
      </h3>
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Updating checklist...
        </div>
      )}
      <div className="space-y-2 mb-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-sm py-1"
          >
            <div className="flex items-center gap-2">
              {item.status === "complete" ? (
                <span className="text-green-600 text-base">✅</span>
              ) : (
                <span className="text-gray-300 text-base">☐</span>
              )}
              <span
                className={
                  item.status === "complete" ? "text-gray-700" : "text-gray-900"
                }
              >
                {item.name}
              </span>
            </div>
            {item.status === "complete" && item.source ? (
              <span className="text-xs text-gray-400">({item.source})</span>
            ) : item.action ? (
              <button className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors">
                {item.action}
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>
              {completed}/{total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500 mb-4">
        You can provide these now or add them later. Claims process faster with
        more documentation upfront.
      </p>
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
          Submit What I Have
        </button>
        <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded text-sm font-medium hover:bg-blue-50 transition-colors">
          Add More
        </button>
      </div>
    </div>
  );
}
