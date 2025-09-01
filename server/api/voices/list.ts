import { Request, Response } from "express";
import { elevenLabsService } from "../../lib/elevenlabs";

/**
 * GET /api/voices/list
 * Get all available voices from ElevenLabs
 */
export async function handleGetVoices(req: Request, res: Response) {
  try {
    // Get user ID from Clerk (we'll add auth middleware later)
    // const { userId } = getAuth(req);
    // if (!userId) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }

    const voicesData = await elevenLabsService.getVoices();
    
    // Return formatted voice data
    const formattedVoices = voicesData.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      description: voice.description,
      preview_url: voice.preview_url,
      labels: voice.labels,
      settings: voice.settings,
    }));

    res.status(200).json({
      success: true,
      voices: formattedVoices
    });

  } catch (error) {
    console.error('[VOICES_LIST_GET]', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch voices';
    
    res.status(500).json({
      error: "Failed to fetch voices from ElevenLabs",
      details: errorMessage
    });
  }
}