import { Request, Response } from "express";
import { elevenLabsService } from "../../lib/elevenlabs";
import { db } from "../../db";
import { agents } from "../../../shared/schema";

/**
 * POST /api/agents/create
 * Create a new AI agent with ElevenLabs
 */
export async function handleCreateAgent(req: Request, res: Response) {
  try {
    // Get user ID from request headers (Clerk authentication)
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: "User authentication required" });
    }

    const { name, prompt, voice_id, stability, similarity_boost, first_message, language } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Agent name is required" });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Agent prompt is required" });
    }

    if (!voice_id) {
      return res.status(400).json({ error: "Voice ID is required" });
    }

    // Create agent in ElevenLabs
    const elevenLabsResponse = await elevenLabsService.createAgent({
      name,
      prompt,
      voice_id,
      stability: stability || 0.7,
      similarity_boost: similarity_boost || 0.8,
      first_message: first_message || "Merhaba! Size nasıl yardımcı olabilirim?",
      language: language || "tr",
    });

    // Save agent to our database
    const [newAgent] = await db.insert(agents).values({
      userId: userId,
      name: name,
      prompt: prompt,
      elevenlabsAgentId: elevenLabsResponse.agent_id,
      voiceId: voice_id,
      stability: stability || 0.7,
      similarityBoost: similarity_boost || 0.8,
    }).returning();

    // Get the phone endpoint URL
    const phoneEndpoint = elevenLabsService.getAgentPhoneEndpoint(elevenLabsResponse.agent_id);

    res.status(201).json({
      success: true,
      agent: {
        id: newAgent.id,
        name: newAgent.name,
        prompt: newAgent.prompt,
        voice_id: newAgent.voiceId,
        stability: newAgent.stability,
        similarity_boost: newAgent.similarityBoost,
        elevenlabs_agent_id: newAgent.elevenlabsAgentId,
        phone_endpoint: phoneEndpoint,
        created_at: newAgent.createdAt,
      },
      message: "Agent created successfully"
    });

  } catch (error) {
    console.error('[AGENT_CREATE_POST]', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to create agent';
    
    res.status(500).json({
      error: "Failed to create agent",
      details: errorMessage
    });
  }
}