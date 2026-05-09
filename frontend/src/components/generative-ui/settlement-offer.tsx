"use client";

interface BreakdownItem {
  label: string;
  offered: number;
  claimed: number;
}

interface SettlementOfferProps {
  claimNumber?: string;
  offeredAmount?: number;
  claimValue?: number;
  breakdown?: BreakdownItem[];
  notes?: string;
  loading?: boolean;
}

export function SettlementOffer({
  claimNumber = "",
  offeredAmount = 0,
  claimValue = 0,
  breakdown = [],
  notes,
  loading = false,
}: SettlementOfferProps) {
  const difference = offeredAmount - claimValue;

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
        <span className="text-2xl">💵</span> Settlement Offer
      </h3>
      {claimNumber && (
        <p className="text-xs text-gray-500 mb-4">Claim #{claimNumber}</p>
      )}
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Loading offer...
        </div>
      )}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Offered amount:</span>
          <span className="font-semibold">
            ${offeredAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Your claim value:</span>
          <span className="font-semibold">${claimValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
          <span>Difference:</span>
          <span
            className={`font-bold ${difference < 0 ? "text-red-600" : "text-green-600"}`}
          >
            {difference < 0 ? "-" : "+"}$
            {Math.abs(difference).toLocaleString()}
          </span>
        </div>
      </div>
      {breakdown.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Breakdown
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left py-1 font-medium">Item</th>
                <th className="text-right py-1 font-medium">Offered</th>
                <th className="text-right py-1 font-medium">Claimed</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1.5">{item.label}</td>
                  <td className="py-1.5 text-right">
                    ${item.offered.toLocaleString()}
                  </td>
                  <td className="py-1.5 text-right">
                    ${item.claimed.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {notes && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          ⚠ {notes}
        </div>
      )}
      <div className="flex gap-2">
        <button className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors">
          Accept Offer
        </button>
        <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
          Counter
        </button>
        <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
          Explain More
        </button>
      </div>
    </div>
  );
}
