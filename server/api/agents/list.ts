import { Request, Response } from "express";
import { db } from "../../db";
import { agents } from "../../../shared/schema";
import { eq } from "drizzle-orm";
import { elevenLabsService } from "../../lib/elevenlabs";

/**
 * GET /api/agents/list
 * Get all agents for the current user
 */
export async function handleListAgents(req: Request, res: Response) {
  try {
    // Get user ID from Clerk (we'll add auth middleware later)
    // const { userId } = getAuth(req);
    // if (!userId) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }
    const userId = "temp-user-id"; // Temporary until auth is implemented

    // Get agents from database
    const userAgents = await db.select()
      .from(agents)
      .where(eq(agents.userId, userId))
      .orderBy(agents.createdAt);

    // Format agents with phone endpoints
    const formattedAgents = userAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      prompt: agent.prompt,
      voice_id: agent.voiceId,
      stability: agent.stability,
      similarity_boost: agent.similarityBoost,
      elevenlabs_agent_id: agent.elevenlabsAgentId,
      phone_endpoint: elevenLabsService.getAgentPhoneEndpoint(agent.elevenlabsAgentId),
      created_at: agent.createdAt,
      updated_at: agent.updatedAt,
    }));

    res.status(200).json({
      success: true,
      agents: formattedAgents
    });

  } catch (error) {
    console.error('[AGENT_LIST_GET]', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch agents';
    
    res.status(500).json({
      error: "Failed to fetch agents",
      details: errorMessage
    });
  }
}