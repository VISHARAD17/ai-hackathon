interface DamageItem {
  component: string;
  severity: number;
  cost: number;
}

interface DamageAssessmentProps {
  damages?: DamageItem[];
  totalMin?: number;
  totalMax?: number;
  verdict?: string;
  loading?: boolean;
}

export function DamageAssessment({
  damages = [
    { component: "Front bumper", severity: 80, cost: 1200 },
    { component: "Hood", severity: 60, cost: 800 },
    { component: "Left headlight", severity: 90, cost: 650 },
  ],
  totalMin = 3250,
  totalMax = 4400,
  verdict = "Repairable",
  loading = false,
}: DamageAssessmentProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-4">🔍 Damage Assessment</h3>
      <div className="space-y-3 mb-4">
        {damages.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span>{item.component}</span>
              <span className="font-medium">${item.cost}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${item.severity}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between font-semibold">
          <span>Total Estimate:</span>
          <span>
            ${totalMin.toLocaleString()} - ${totalMax.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Verdict:</span>
          <span className="text-green-600 font-medium">{verdict}</span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Check Coverage
        </button>
        <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50">
          Find Shops
        </button>
      </div>
    </div>
  );
}
