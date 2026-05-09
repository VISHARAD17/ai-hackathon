"use client";

interface DamageComponent {
  name: string;
  severity: string;
  estimatedCost: number;
}

interface DamageAssessmentProps {
  components?: DamageComponent[];
  totalEstimateMin?: number;
  totalEstimateMax?: number;
  verdict?: string;
  vehicleValue?: number;
  loading?: boolean;
}

const SEVERITY_WIDTH: Record<string, number> = {
  Minor: 30,
  Moderate: 60,
  Severe: 90,
};

const SEVERITY_COLOR: Record<string, string> = {
  Minor: "bg-yellow-400",
  Moderate: "bg-orange-500",
  Severe: "bg-red-500",
};

export function DamageAssessment({
  components = [],
  totalEstimateMin = 0,
  totalEstimateMax = 0,
  verdict = "Repairable",
  vehicleValue,
  loading = false,
}: DamageAssessmentProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🔍</span> Damage Assessment
      </h3>
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Analyzing damage...
        </div>
      )}
      <div className="space-y-3 mb-4">
        {components.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-600">
                ${item.estimatedCost.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${SEVERITY_COLOR[item.severity] ?? "bg-gray-400"}`}
                  style={{ width: `${SEVERITY_WIDTH[item.severity] ?? 50}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-16">{item.severity}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between font-semibold text-sm">
          <span>Total Estimate:</span>
          <span>
            ${totalEstimateMin.toLocaleString()} - $
            {totalEstimateMax.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Verdict:</span>
          <span
            className={`font-medium ${verdict === "Total Loss" ? "text-red-600" : "text-green-600"}`}
          >
            {verdict}
          </span>
        </div>
        {vehicleValue != null && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Vehicle Value:</span>
            <span>${vehicleValue.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
          Check Coverage
        </button>
        <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded text-sm font-medium hover:bg-blue-50 transition-colors">
          Find Shops
        </button>
      </div>
    </div>
  );
}
