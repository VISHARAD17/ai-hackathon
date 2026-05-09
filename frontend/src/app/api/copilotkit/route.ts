import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

const backendUrl =
  process.env.AGENT_URL ?? "http://localhost:8000/copilotkit";

const runtime = new CopilotRuntime({
  agents: {
    insurance_copilot: new HttpAgent({
      url: backendUrl,
      agentId: "insurance_copilot",
      description:
        "Insurance claim copilot that renders interactive UI components",
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
