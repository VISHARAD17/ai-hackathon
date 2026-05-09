"use client";

interface ClaimSummaryProps {
  claimType?: string;
  date?: string;
  location?: string;
  policyNumber?: string;
  faultParty?: string;
  damages?: string;
  estimatedRange?: string;
  coverageType?: string;
  deductible?: number;
  expectedPayout?: string;
  documentsProvided?: number;
  documentsTotal?: number;
  missingDocuments?: string[];
  loading?: boolean;
}

export function ClaimSummary({
  claimType = "",
  date = "",
  location = "",
  policyNumber = "",
  faultParty = "",
  damages = "",
  estimatedRange = "",
  coverageType = "",
  deductible = 0,
  expectedPayout = "",
  documentsProvided = 0,
  documentsTotal = 0,
  missingDocuments = [],
  loading = false,
}: ClaimSummaryProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">📋</span> Claim Summary — Ready to Submit
      </h3>
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Preparing summary...
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
        <span className="text-gray-500">Type:</span>
        <span className="font-medium">{claimType}</span>

        <span className="text-gray-500">Date:</span>
        <span className="font-medium">{date}</span>

        <span className="text-gray-500">Location:</span>
        <span className="font-medium">{location}</span>

        <span className="text-gray-500">Policy:</span>
        <span className="font-medium">{policyNumber}</span>

        <span className="text-gray-500">Fault:</span>
        <span className="font-medium">{faultParty}</span>
      </div>

      <div className="border-t pt-3 mb-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Damages
        </h4>
        <p className="text-sm">{damages}</p>
        <p className="text-sm text-gray-600">Estimated: {estimatedRange}</p>
      </div>

      <div className="border-t pt-3 mb-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Coverage
        </h4>
        <p className="text-sm">{coverageType}</p>
        <p className="text-sm text-gray-600">
          Expected payout: {expectedPayout}
        </p>
      </div>

      <div className="border-t pt-3 mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Documents
        </h4>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{
                width: `${documentsTotal > 0 ? (documentsProvided / documentsTotal) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {documentsProvided}/{documentsTotal}
          </span>
        </div>
        {missingDocuments.length > 0 && (
          <p className="text-xs text-amber-600">
            Missing: {missingDocuments.join(", ")}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors">
          Submit Claim
        </button>
        <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
          Edit Details
        </button>
        <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
          Add Docs
        </button>
      </div>
    </div>
  );
}
