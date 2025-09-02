import { Request, Response } from 'express';
import { getAIResponse } from '../../anthropic';

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

    // Konuşma bağlamını oluştur
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      // Son 5 konuşmayı al
      const recentHistory = conversationHistory.slice(-5) as ConversationMessage[];
      conversationContext = recentHistory.map((msg: ConversationMessage) => 
        `Kullanıcı: ${msg.user}\nAsistan: ${msg.ai}`
      ).join('\n\n');
    }

    // Anthropic AI'ye gönder - getAIResponse fonksiyonunu kullan
    const userId = 'voice_assistant_user'; // Sesli asistan için sabit ID
    const aiResponse = await getAIResponse(userMessage, userId);

    if (!aiResponse) {
      return res.status(500).json({ 
        error: 'AI yanıtı alınamadı',
        message: 'Anthropic AI servisi yanıt veremedi. Lütfen tekrar deneyin.'
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