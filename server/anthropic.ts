import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Bu fonksiyon, bir metin istemine Anthropic'ten cevap alır
export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", // En yeni ve en iyi fiyat/performans modeli
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });
    
    // Gelen cevabın içindeki metni ayıklayıp geri döndür
    if (msg.content[0].type === "text") {
        return msg.content[0].text;
    } else {
        return "Üzgünüm, şu an cevap veremiyorum.";
    }

  } catch (error) {
    console.error("Error getting AI response from Anthropic:", error);
    return "Bir hata oluştu, lütfen daha sonra tekrar deneyin.";
  }
}