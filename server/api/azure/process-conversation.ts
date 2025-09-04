import { Request, Response } from 'express';
import { getAIResponse } from '../../gemini';

interface ConversationMessage {
  user: string;
  ai: string;
}

export async function handleProcessConversation(req: Request, res: Response) {
  try {
    console.log('🤖 Azure Conversation API endpoint\'e istek geldi');

    const { userMessage, conversationHistory = [] } = req.body;

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
      return res.status(400).json({ 
        error: 'Kullanıcı mesajı bulunamadı',
        message: 'Lütfen bir mesaj gönderin' 
      });
    }

    console.log(`💬 Kullanıcı mesajı: "${userMessage}"`);
    console.log(`📚 Konuşma geçmişi: ${conversationHistory.length} mesaj`);

    // Her oturum için unique session ID oluştur
    const sessionId = req.headers['x-user-id'] as string || `session_${Date.now()}`;
    console.log(`🔑 Session ID: ${sessionId}`);

    // Konuşma geçmişini Gemini'ye geçmeden önce sıfırla (fresh start için)
    // Çünkü frontend'den gelen conversationHistory'yi kullanacağız
    
    // Eğer conversationHistory varsa, bunu kullan
    if (conversationHistory.length > 0) {
      // Son 5 konuşmayı al ve Gemini formatına çevir
      const recentHistory = conversationHistory.slice(-5) as ConversationMessage[];
      const historyForGemini = recentHistory.flatMap((msg: ConversationMessage) => [
        { role: 'user' as const, content: msg.user },
        { role: 'assistant' as const, content: msg.ai }
      ]);
      
      // Gemini'nin memory'sini bu session için güncelle
      const { setConversationHistory } = await import('../../gemini');
      setConversationHistory(sessionId, historyForGemini);
    }

    // AI yanıtını al
    const aiResponse = await getAIResponse(userMessage, sessionId);

    if (!aiResponse) {
      return res.status(500).json({ 
        error: 'AI yanıtı alınamadı',
        message: 'Gemini AI servisi yanıt veremedi. Lütfen tekrar deneyin.'
      });
    }

    console.log(`✅ AI yanıtı: "${aiResponse}"`);

    res.json({
      success: true,
      response: aiResponse,
      userMessage: userMessage,
      message: 'Konuşma başarıyla işlendi'
    });

  } catch (error) {
    console.error('❌ Azure Conversation API hatası:', error);
    
    res.status(500).json({
      error: 'Konuşma işleme hatası',
      message: 'AI ile konuşma sırasında bir hata oluştu',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}