"use client";

import { useCopilotActions } from "@/hooks/use-copilot-actions";

export default function Home() {
  useCopilotActions();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <main className="flex flex-col items-center justify-center max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            🛡️ Insurance Claim Copilot
          </h1>
          <p className="text-xl text-gray-700">
            AI-powered assistant for filing and managing insurance claims
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Get Started
          </h2>
          <p className="text-gray-600 mb-6">
            Open the chat sidebar and describe what happened. The AI will guide
            you through the claim process with interactive forms and analysis.
          </p>

          <div className="space-y-3 text-left">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Try saying:</p>
              <p className="font-medium text-gray-800">
                "I was in a car accident yesterday on Highway 101"
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Or:</p>
              <p className="font-medium text-gray-800">
                "My basement flooded from a burst pipe"
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Or:</p>
              <p className="font-medium text-gray-800">
                "Am I covered for windshield damage?"
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold mb-2">Smart Forms</h3>
            <p className="text-sm text-gray-600">
              Forms pre-filled from your conversation
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold mb-2">Damage Assessment</h3>
            <p className="text-sm text-gray-600">
              Visual breakdown with cost estimates
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">🛡️</div>
            <h3 className="font-semibold mb-2">Coverage Analysis</h3>
            <p className="text-sm text-gray-600">
              Understand what's covered instantly
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

