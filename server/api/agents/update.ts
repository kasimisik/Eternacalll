import { Request, Response } from "express";
import { elevenLabsService } from "../../lib/elevenlabs";
import { db } from "../../db";
import { agents } from "../../../shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * PATCH /api/agents/update/:id
 * Update an existing agent
 */
export async function handleUpdateAgent(req: Request, res: Response) {
  try {
    // Get user ID from Clerk (we'll add auth middleware later)
    // const { userId } = getAuth(req);
    // if (!userId) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }
    const userId = "temp-user-id"; // Temporary until auth is implemented

    const agentId = req.params.id;
    const { name, prompt, voice_id, stability, similarity_boost, first_message, language } = req.body;

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

    // Update agent in ElevenLabs
    const updateData: any = {};
    if (name) updateData.name = name;
    if (prompt) updateData.prompt = prompt;
    if (voice_id) updateData.voice_id = voice_id;
    if (stability !== undefined) updateData.stability = stability;
    if (similarity_boost !== undefined) updateData.similarity_boost = similarity_boost;
    if (first_message) updateData.first_message = first_message;
    if (language) updateData.language = language;

    await elevenLabsService.updateAgent(existingAgent.elevenlabsAgentId, updateData);

    // Update agent in our database
    const [updatedAgent] = await db.update(agents)
      .set({
        name: name || existingAgent.name,
        prompt: prompt || existingAgent.prompt,
        voiceId: voice_id || existingAgent.voiceId,
        stability: stability !== undefined ? stability : existingAgent.stability,
        similarityBoost: similarity_boost !== undefined ? similarity_boost : existingAgent.similarityBoost,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId))
      .returning();

    // Get the phone endpoint URL
    const phoneEndpoint = elevenLabsService.getAgentPhoneEndpoint(updatedAgent.elevenlabsAgentId);

    res.status(200).json({
      success: true,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        prompt: updatedAgent.prompt,
        voice_id: updatedAgent.voiceId,
        stability: updatedAgent.stability,
        similarity_boost: updatedAgent.similarityBoost,
        elevenlabs_agent_id: updatedAgent.elevenlabsAgentId,
        phone_endpoint: phoneEndpoint,
        created_at: updatedAgent.createdAt,
        updated_at: updatedAgent.updatedAt,
      },
      message: "Agent updated successfully"
    });

  } catch (error) {
    console.error('[AGENT_UPDATE_PATCH]', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to update agent';
    
    res.status(500).json({
      error: "Failed to update agent",
      details: errorMessage
    });
  }
}