import { Request, Response } from 'express';
import { textToSpeech } from '../../azure';

export async function handleTextToSpeech(req: Request, res: Response) {
  try {
    console.log('🔊 Azure TTS API endpoint\'e istek geldi');

    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ 
        error: 'Metin bulunamadı',
        message: 'Lütfen konuşturulacak bir metin gönderin' 
      });
    }

    console.log(`📝 Metinden sese çevrilecek: "${text}"`);

    // Azure Text-to-Speech servisine gönder
    const audioBuffer = await textToSpeech(text);

    if (!audioBuffer) {
      return res.status(500).json({ 
        error: 'Ses üretilemedi',
        message: 'Azure TTS servisi ses üretemedi. Lütfen tekrar deneyin.'
      });
    }

    console.log(`✅ TTS başarılı: ${audioBuffer.length} bytes ses üretildi`);

    // Ses dosyasını direkt olarak döndür
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Azure TTS API hatası:', error);
    
    res.status(500).json({
      error: 'Azure TTS servisi hatası',
      message: 'Ses üretimi sırasında bir hata oluştu',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}