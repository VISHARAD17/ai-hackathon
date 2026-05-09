"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { ClaimForm } from "@/components/generative-ui/claim-form";
import { DamageAssessment } from "@/components/generative-ui/damage-assessment";
import { CoverageAnalysis } from "@/components/generative-ui/coverage-analysis";
import { CostCalculator } from "@/components/generative-ui/cost-calculator";
import { DocumentChecklist } from "@/components/generative-ui/document-checklist";
import { ClaimTimeline } from "@/components/generative-ui/claim-timeline";
import { SettlementOffer } from "@/components/generative-ui/settlement-offer";
import { ProviderFinder } from "@/components/generative-ui/provider-finder";
import { ClaimSummary } from "@/components/generative-ui/claim-summary";

const noop = async () => {};

export function useCopilotActions() {
  useCopilotAction({
    name: "showClaimForm",
    description: "Render a claim intake form pre-filled from conversation",
    parameters: [
      { name: "claimType", type: "string", required: false },
      { name: "date", type: "string", required: false },
      { name: "location", type: "string", required: false },
      { name: "description", type: "string", required: false },
      { name: "fields", type: "object[]", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <ClaimForm {...args} loading={status === "inProgress"} />
    ),
  });

  useCopilotAction({
    name: "showDamageAssessment",
    description:
      "Render a visual damage breakdown with severity bars and cost estimates",
    parameters: [
      { name: "components", type: "object[]", required: false },
      { name: "totalEstimateMin", type: "number", required: false },
      { name: "totalEstimateMax", type: "number", required: false },
      { name: "verdict", type: "string", required: false },
      { name: "vehicleValue", type: "number", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <DamageAssessment {...args} loading={status === "inProgress"} />
    ),
  });

  useCopilotAction({
    name: "showCoverageAnalysis",
    description:
      "Render a policy coverage table matched against the current claim",
    parameters: [
      { name: "policyNumber", type: "string", required: false },
      { name: "coverages", type: "object[]", required: false },
      { name: "claimEstimate", type: "number", required: false },
      { name: "deductible", type: "number", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <CoverageAnalysis {...args} loading={status === "inProgress"} />
    ),
  });

  useCopilotAction({
    name: "showCostCalculator",
    description: "Render an itemized cost and settlement calculator",
    parameters: [
      { name: "items", type: "object[]", required: false },
      { name: "deductible", type: "number", required: false },
      { name: "notes", type: "string", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <CostCalculator {...args} loading={status === "inProgress"} />
    ),
  });

  useCopilotAction({
    name: "showDocumentChecklist",
    description:
      "Render the required-document checklist with completion status",
    parameters: [
      { name: "items", type: "object[]", required: false },
      { name: "progress", type: "object", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <DocumentChecklist {...args} loading={status === "inProgress"} />
    ),
  });

  useCopilotAction({
    name: "showClaimTimeline",
    description:
      "Render a claim progress tracker showing current stage and dates",
    parameters: [
      { name: "claimNumber", type: "string", required: false },
      { name: "stages", type: "object[]", required: false },
      { name: "estimatedResolution", type: "string", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <ClaimTimeline {...args} loading={status === "inProgress"} />
    ),
  });

  useCopilotAction({
    name: "showSettlementOffer",
    description: "Render a settlement offer card with accept/counter options",
    parameters: [
      { name: "claimNumber", type: "string", required: false },
      { name: "offeredAmount", type: "number", required: false },
      { name: "claimValue", type: "number", required: false },
      { name: "breakdown", type: "object[]", required: false },
      { name: "notes", type: "string", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <SettlementOffer {...args} loading={status === "inProgress"} />
    ),
  });

  useCopilotAction({
    name: "showProviderFinder",
    description:
      "Render a list of nearby in-network repair shops or medical providers",
    parameters: [
      { name: "providers", type: "object[]", required: false },
      { name: "claimType", type: "string", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <ProviderFinder {...args} loading={status === "inProgress"} />
    ),
  });

  useCopilotAction({
    name: "showClaimSummary",
    description: "Render the final claim summary for review before submission",
    parameters: [
      { name: "claimType", type: "string", required: false },
      { name: "date", type: "string", required: false },
      { name: "location", type: "string", required: false },
      { name: "policyNumber", type: "string", required: false },
      { name: "faultParty", type: "string", required: false },
      { name: "damages", type: "string", required: false },
      { name: "estimatedRange", type: "string", required: false },
      { name: "coverageType", type: "string", required: false },
      { name: "deductible", type: "number", required: false },
      { name: "expectedPayout", type: "string", required: false },
      { name: "documentsProvided", type: "number", required: false },
      { name: "documentsTotal", type: "number", required: false },
      { name: "missingDocuments", type: "string[]", required: false },
    ],
    handler: noop,
    render: ({ args, status }) => (
      <ClaimSummary {...args} loading={status === "inProgress"} />
    ),
  });
}
