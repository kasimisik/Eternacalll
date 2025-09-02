import { Request, Response } from 'express';
import { speechToText } from '../../azure';
import multer from 'multer';

// Multer yapılandırması - geçici dosya kullanmadan
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Ses dosyası formatlarını kabul et
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export const uploadMiddleware = upload.single('audio');

export async function handleSpeechToText(req: Request, res: Response) {
  try {
    console.log('🎤 Azure STT API endpoint\'e istek geldi');

    if (!req.file) {
      return res.status(400).json({ 
        error: 'Ses dosyası bulunamadı',
        message: 'Lütfen bir ses dosyası yükleyin' 
      });
    }

    console.log(`📁 Dosya alındı: ${req.file.originalname}, Boyut: ${req.file.size} bytes`);

    // Azure Speech-to-Text servisine gönder
    const recognizedText = await speechToText(req.file.buffer);

    if (!recognizedText) {
      return res.status(500).json({ 
        error: 'Konuşma tanınamadı',
        message: 'Azure STT servisi konuşmayı tanıyamadı. Lütfen tekrar deneyin.'
      });
    }

    console.log(`✅ STT başarılı: "${recognizedText}"`);

    res.json({
      success: true,
      text: recognizedText,
      message: 'Konuşma başarıyla tanındı'
    });

  } catch (error) {
    console.error('❌ Azure STT API hatası:', error);
    
    res.status(500).json({
      error: 'Azure STT servisi hatası',
      message: 'Konuşma tanıma sırasında bir hata oluştu',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}