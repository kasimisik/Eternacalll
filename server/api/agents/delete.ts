import { Request, Response } from "express";
import { elevenLabsService } from "../../lib/elevenlabs";
import { db } from "../../db";
import { agents } from "../../../shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * DELETE /api/agents/delete/:id
 * Delete an agent
 */
export async function handleDeleteAgent(req: Request, res: Response) {
  try {
    // Get user ID from request headers (Clerk authentication)
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: "User authentication required" });
    }

    const agentId = req.params.id;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID is required" });
    }

    // Get the agent from our database
    const [existingAgent] = await db.select()
      .from(agents)
      .where(and(
        eq(agents.id, agentId),
        eq(agents.userId, userId)
      ))
      .limit(1);

    if (!existingAgent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Delete agent from ElevenLabs
    await elevenLabsService.deleteAgent(existingAgent.elevenlabsAgentId);

    // Delete agent from our database
    await db.delete(agents)
      .where(eq(agents.id, agentId));

    res.status(200).json({
      success: true,
      message: "Agent deleted successfully"
    });

  } catch (error) {
    console.error('[AGENT_DELETE]', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to delete agent';
    
    res.status(500).json({
      error: "Failed to delete agent",
      details: errorMessage
    });
  }
}