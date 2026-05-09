"use client";

interface TimelineStage {
  name: string;
  date: string;
  status: string;
  details: string;
}

interface ClaimTimelineProps {
  claimNumber?: string;
  stages?: TimelineStage[];
  estimatedResolution?: string;
  loading?: boolean;
}

export function ClaimTimeline({
  claimNumber = "",
  stages = [],
  estimatedResolution = "",
  loading = false,
}: ClaimTimelineProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
        <span className="text-2xl">📊</span> Claim Status
      </h3>
      {claimNumber && (
        <p className="text-xs text-gray-500 mb-4">#{claimNumber}</p>
      )}
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Loading timeline...
        </div>
      )}
      <div className="space-y-0 mb-4">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          return (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                {stage.status === "complete" ? (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs shrink-0">
                    ✓
                  </div>
                ) : stage.status === "in_progress" ? (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 ${stage.status === "complete" ? "bg-green-300" : "bg-gray-200"}`}
                  />
                )}
              </div>
              <div className="pb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{stage.name}</span>
                  {stage.date && (
                    <span className="text-xs text-gray-400">{stage.date}</span>
                  )}
                </div>
                {stage.details && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {stage.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {estimatedResolution && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          Estimated resolution: <strong>{estimatedResolution}</strong>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
          Check for Updates
        </button>
        <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded text-sm font-medium hover:bg-blue-50 transition-colors">
          Contact Adjuster
        </button>
      </div>
    </div>
  );
}
