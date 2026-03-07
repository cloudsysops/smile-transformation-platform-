import { loadAgentPrompt } from "@/lib/ai/agent-loader";
import type { AgentId } from "@/lib/ai/agent-registry";

export type AgentName = "lead-triage" | "sales-responder" | "itinerary-generator";

/** Load system prompt for an agent. Uses agent-loader (file-based, cached). */
export async function getAgentSystemPrompt(agentName: AgentName): Promise<string> {
  return loadAgentPrompt(agentName as AgentId);
}
