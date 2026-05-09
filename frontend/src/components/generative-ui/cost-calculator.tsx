"use client";

interface CostItem {
  label: string;
  amount: number;
}

interface CostCalculatorProps {
  items?: CostItem[];
  deductible?: number;
  notes?: string;
  loading?: boolean;
}

export function CostCalculator({
  items = [],
  deductible = 0,
  notes,
  loading = false,
}: CostCalculatorProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const expectedPayout = Math.max(0, total - deductible);

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">💰</span> Settlement Calculator
      </h3>
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Calculating costs...
        </div>
      )}
      <div className="space-y-2 mb-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-700">{item.label}</span>
            <span
              className={`font-medium ${item.amount < 0 ? "text-red-600" : ""}`}
            >
              {item.amount < 0 ? "-" : ""}$
              {Math.abs(item.amount).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 space-y-2">
        <div className="flex justify-between text-sm font-semibold">
          <span>Total claim value</span>
          <span>${total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Your deductible</span>
          <span>-${deductible.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t pt-2">
          <span>Expected payout</span>
          <span className="text-green-600">
            ${expectedPayout.toLocaleString()}
          </span>
        </div>
      </div>
      {notes && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          {notes}
        </div>
      )}
      <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
        Proceed to Filing
      </button>
    </div>
  );
}
