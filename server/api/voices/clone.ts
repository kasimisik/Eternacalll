import { Request, Response } from "express";
import { elevenLabsService } from "../../lib/elevenlabs";
import multer from "multer";

/**
 * POST /api/voices/clone
 * Create a new voice by cloning from uploaded audio files
 */

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

export const uploadMiddleware = upload.array('files', 5);

export async function handleCloneVoice(req: Request, res: Response) {
  try {
    // Get user ID from Clerk (we'll add auth middleware later)
    // const { userId } = getAuth(req);
    // if (!userId) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }

    const { name, description, labels } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!name) {
      return res.status(400).json({ error: "Voice name is required" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "At least one audio file is required" });
    }

    // Convert multer files to format for ElevenLabs API
    const audioFiles = files.map(file => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }));

    const parsedLabels = labels ? JSON.parse(labels) : undefined;

    const result = await elevenLabsService.createVoice({
      name,
      description,
      files: audioFiles,
      labels: parsedLabels,
    });

    res.status(201).json({
      success: true,
      voice_id: result.voice_id,
      message: "Voice cloned successfully"
    });

  } catch (error) {
    console.error('[VOICE_CLONE_POST]', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to clone voice';
    
    res.status(500).json({
      error: "Failed to clone voice",
      details: errorMessage
    });
  }
}