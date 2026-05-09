interface CoverageItem {
  name: string;
  covered: boolean;
  limit?: string;
  deductible?: string;
}

interface CoverageAnalysisProps {
  policyNumber?: string;
  coverages?: CoverageItem[];
  estimateMin?: number;
  estimateMax?: number;
  deductible?: number;
  loading?: boolean;
}

export function CoverageAnalysis({
  policyNumber = "AUTO-7829",
  coverages = [
    { name: "Collision", covered: true, limit: "$50,000", deductible: "$500" },
    { name: "Comprehensive", covered: true, limit: "$50,000", deductible: "$250" },
    { name: "Rental reimbursement", covered: true, limit: "$40/day", deductible: "—" },
    { name: "Medical (PIP)", covered: true, limit: "$10,000", deductible: "—" },
    { name: "Diminished value", covered: false, limit: "—", deductible: "—" },
  ],
  estimateMin = 3250,
  estimateMax = 4400,
  deductible = 500,
  loading = false,
}: CoverageAnalysisProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-4">
        🛡️ Your Coverage — Policy {policyNumber}
      </h3>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Coverage</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Limit</th>
              <th className="text-left py-2">Ded.</th>
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
                    <span className="text-red-600">❌ No</span>
                  )}
                </td>
                <td className="py-2">{item.limit}</td>
                <td className="py-2">{item.deductible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-2">
        <h4 className="font-semibold">For this claim:</h4>
        <div className="flex justify-between text-sm">
          <span>Damage estimate:</span>
          <span>
            ${estimateMin.toLocaleString()} - ${estimateMax.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Your deductible:</span>
          <span>-${deductible.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>You pay:</span>
          <span>${deductible.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Insurance covers:</span>
          <span>
            ${(estimateMin - deductible).toLocaleString()} - $
            {(estimateMax - deductible).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          File This Claim
        </button>
        <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50">
          Estimate Breakdown
        </button>
      </div>
    </div>
  );
}
