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

    // Türkçe sesler için parametre al
    const language = req.query.language as string || 'tr'; // Varsayılan olarak Türkçe sesler
    const voicesData = await elevenLabsService.getVoices(language);
    
    // Return formatted voice data with Turkish support indication
    const finalVoices = voicesData.voices.slice(0, 20).map(voice => ({
      id: voice.voice_id,
      name: voice.name + ' (Multilingual - Türkçe Destekli)',
      category: voice.category,
      description: voice.description || 'ElevenLabs multilingual model ile Türkçe konuşabilen ses',
      preview_url: voice.preview_url,
      labels: voice.labels,
      settings: voice.settings,
      supportsTurkish: true
    }));

    res.status(200).json({
      success: true,
      voices: finalVoices
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