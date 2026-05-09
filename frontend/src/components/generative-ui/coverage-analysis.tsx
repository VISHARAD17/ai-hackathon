"use client";

interface CoverageItem {
  name: string;
  covered: boolean;
  limit: string;
  deductible: string;
}

interface CoverageAnalysisProps {
  policyNumber?: string;
  coverages?: CoverageItem[];
  claimEstimate?: number;
  deductible?: number;
  loading?: boolean;
}

export function CoverageAnalysis({
  policyNumber = "AUTO-7829",
  coverages = [],
  claimEstimate = 0,
  deductible = 0,
  loading = false,
}: CoverageAnalysisProps) {
  const insuranceCovers = Math.max(0, claimEstimate - deductible);

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🛡️</span> Your Coverage — Policy{" "}
        {policyNumber}
      </h3>
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Analyzing coverage...
        </div>
      )}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="text-left py-2 font-medium">Coverage</th>
              <th className="text-left py-2 font-medium">Status</th>
              <th className="text-left py-2 font-medium">Limit</th>
              <th className="text-left py-2 font-medium">Ded.</th>
            </tr>
          </thead>
          <tbody>
            {coverages.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{item.name}</td>
                <td className="py-2">
                  {item.covered ? (
                    <span className="text-green-600">✅ Yes</span>
                  ) : (
                    <span className="text-red-500">❌ No</span>
                  )}
                </td>
                <td className="py-2 text-gray-600">{item.limit}</td>
                <td className="py-2 text-gray-600">{item.deductible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {claimEstimate > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">For this claim:</h4>
          <div className="flex justify-between text-sm">
            <span>Damage estimate:</span>
            <span>${claimEstimate.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Your deductible:</span>
            <span>-${deductible.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-sm border-t pt-2">
            <span>You pay:</span>
            <span>${deductible.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-sm">
            <span>Insurance covers:</span>
            <span>${insuranceCovers.toLocaleString()}</span>
          </div>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
          File This Claim
        </button>
        <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded text-sm font-medium hover:bg-blue-50 transition-colors">
          Estimate Breakdown
        </button>
      </div>
    </div>
  );
}
