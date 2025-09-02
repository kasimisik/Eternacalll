import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Konuşma geçmişini saklamak için basit bir hafıza sistemi
const conversationMemory = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>();

// Bu fonksiyon, doğal diyalog için geliştirilmiş AI yanıtı üretir
export async function getAIResponse(userInput: string, userId?: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('🤖 Anthropic Mock: User said:', userInput);
    // Mock mode'da bile doğal cevaplar verelim
    const mockResponses = [
      "Anlıyorum, bu konu gerçekten ilginç. Peki bu durumla ilgili ne düşünüyorsun?",
      "Harika! Bu konuda daha fazla detay verebilir misin?",
      "O zaman bu durumu nasıl değerlendiriyorsun sen?"
    ];
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Kullanıcı ID'si ile geçmişi al veya yeni oluştur
    const sessionId = userId || 'default';
    let conversationHistory = conversationMemory.get(sessionId) || [];
    
    // Kullanıcının yeni mesajını geçmişe ekle
    conversationHistory.push({role: 'user', content: userInput});
    
    // Son 10 mesajı tut (hafıza sınırlaması)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    // Yeni nesil sistem prompt'u
    const systemPrompt = `Sen Kimsin? Sen, sadece komutları yerine getiren bir asistan değilsin. Sen, akıcı, doğal ve bağlama duyarlı bir Diyalog Ortağı'sın. Senin temel amacın, kullanıcıyla kesintisiz bir sohbet sürdürmek, onu anlamak ve konuşmayı canlı tutmaktır.

TEMEL KURALLAR:
1. Aktif Dinleyici Ol: Kullanıcının ne söylediğine ve nasıl söylediğine odaklan
2. Hafızanı Kullan: Önceki konuşmaları referans al, bağlamı koru
3. Sohbeti Canlı Tut: Her cevabının sonunda açık uçlu bir soru sor
4. Kısa ve Öz Ol: 1-2 cümle ile net cevaplar ver
5. Varsayımlarda Bulun: Mantıklı çıkarımlar yap ve onay iste

ÖNEMLİ: Cevabının başında veya sonunda "Cevabım:", "İşte yanıtın:" gibi ek ifadeler KULLANMA. Sadece konuşma metnini üret.

ÖRNEK İYİ CEVAP: "Kulağa zor bir gün gibi geliyor. Belki de rahatlatıcı bir şeyler konuşmak istersin, ne dersin?"

Şimdi kullanıcıyla doğal bir sohbet sürdür.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 150,
      system: systemPrompt,
      messages: conversationHistory
    });

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';
    
    // AI'ın cevabını da geçmişe ekle
    conversationHistory.push({role: 'assistant', content: responseText});
    conversationMemory.set(sessionId, conversationHistory);
    
    console.log('🤖 Advanced AI Response:', responseText);
    return responseText;

  } catch (error) {
    console.error('Anthropic API Error:', error);
    return "Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin.";
  }
}