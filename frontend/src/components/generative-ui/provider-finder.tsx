"use client";

interface Provider {
  name: string;
  rating: number;
  distance: string;
  inNetwork: boolean;
  estimatedDays: number;
}

interface ProviderFinderProps {
  providers?: Provider[];
  claimType?: string;
  loading?: boolean;
}

export function ProviderFinder({
  providers = [],
  claimType = "auto",
  loading = false,
}: ProviderFinderProps) {
  const icon = claimType === "medical" ? "🏥" : "🔧";
  const title =
    claimType === "medical"
      ? "Recommended Providers"
      : "Recommended Repair Shops";

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span> {title}
      </h3>
      {loading && (
        <div className="text-sm text-blue-600 mb-3 animate-pulse">
          Finding providers near you...
        </div>
      )}
      <div className="space-y-3">
        {providers.map((provider, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-3 hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-sm">{provider.name}</span>
              <span className="text-sm text-amber-500">
                {"★".repeat(Math.round(provider.rating))}{" "}
                <span className="text-gray-500">{provider.rating}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <span>{provider.distance}</span>
              <span>·</span>
              {provider.inNetwork ? (
                <span className="text-green-600 font-medium">In-network</span>
              ) : (
                <span className="text-amber-600 font-medium">
                  Out-of-network
                </span>
              )}
              <span>·</span>
              <span>Est. {provider.estimatedDays} days</span>
            </div>
            {!provider.inNetwork && (
              <p className="text-xs text-amber-600 mb-2">
                ⚠ Out-of-network may increase costs
              </p>
            )}
            <button className="w-full text-center bg-blue-50 text-blue-600 py-1.5 rounded text-sm font-medium hover:bg-blue-100 transition-colors">
              Select
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
          Show More
        </button>
        <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
          Skip for Now
        </button>
      </div>
    </div>
  );
}
