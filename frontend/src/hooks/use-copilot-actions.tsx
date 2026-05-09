"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { ClaimForm } from "@/components/generative-ui/claim-form";
import { DamageAssessment } from "@/components/generative-ui/damage-assessment";
import { CoverageAnalysis } from "@/components/generative-ui/coverage-analysis";

export function useCopilotActions() {
  useCopilotAction({
    name: "showClaimForm",
    description: "Render a claim intake form pre-filled from conversation",
    parameters: [
      {
        name: "claimType",
        type: "string",
        description: "Type of claim (e.g., Auto Collision, Water Damage, Theft)",
        required: false,
      },
      {
        name: "date",
        type: "string",
        description: "Date of incident",
        required: false,
      },
      {
        name: "location",
        type: "string",
        description: "Location where incident occurred",
        required: false,
      },
      {
        name: "description",
        type: "string",
        description: "Description of what happened",
        required: false,
      },
    ],
    handler: async () => {},
    render: ({ args, status }) => {
      return <ClaimForm {...args} loading={status === "inProgress"} />;
    },
  });

  useCopilotAction({
    name: "showDamageAssessment",
    description: "Render a damage assessment with component-level breakdown",
    parameters: [
      {
        name: "damages",
        type: "object[]",
        description: "Array of damaged components with severity and cost",
        required: false,
      },
      {
        name: "totalMin",
        type: "number",
        description: "Minimum total estimate",
        required: false,
      },
      {
        name: "totalMax",
        type: "number",
        description: "Maximum total estimate",
        required: false,
      },
      {
        name: "verdict",
        type: "string",
        description: "Assessment verdict (e.g., Repairable, Total Loss)",
        required: false,
      },
    ],
    handler: async () => {},
    render: ({ args, status }) => {
      return <DamageAssessment {...args} loading={status === "inProgress"} />;
    },
  });

  useCopilotAction({
    name: "showCoverageAnalysis",
    description: "Render coverage analysis with policy details",
    parameters: [
      {
        name: "policyNumber",
        type: "string",
        description: "Policy number",
        required: false,
      },
      {
        name: "coverages",
        type: "object[]",
        description: "Array of coverage items with status, limits, and deductibles",
        required: false,
      },
      {
        name: "estimateMin",
        type: "number",
        description: "Minimum damage estimate",
        required: false,
      },
      {
        name: "estimateMax",
        type: "number",
        description: "Maximum damage estimate",
        required: false,
      },
      {
        name: "deductible",
        type: "number",
        description: "Applicable deductible amount",
        required: false,
      },
    ],
    handler: async () => {},
    render: ({ args, status }) => {
      return <CoverageAnalysis {...args} loading={status === "inProgress"} />;
    },
  });
}
