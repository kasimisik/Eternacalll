import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || "" });

// Konuşma geçmişini saklamak için basit bir hafıza sistemi
const conversationMemory = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>();

// Konuşma geçmişini manuel olarak set etme fonksiyonu
export function setConversationHistory(sessionId: string, history: Array<{role: 'user' | 'assistant', content: string}>) {
    conversationMemory.set(sessionId, [...history]);
    console.log(`📝 Session ${sessionId} için konuşma geçmişi güncellendi: ${history.length} mesaj`);
}

export async function getAIResponse(userInput: string, userId?: string): Promise<string> {
    try {
        if (!process.env.GOOGLE_AI_API_KEY) {
            console.warn("🤖 Gemini Mock: User said:", userInput);
            const mockResponses = [
                "Anlıyorum, bu konu gerçekten ilginç. Peki bu durumla ilgili ne düşünüyorsun?",
                "Harika! Bu konuda daha fazla detay verebilir misin?",
                "O zaman bu durumu nasıl değerlendiriyorsun sen?"
            ];
            return mockResponses[Math.floor(Math.random() * mockResponses.length)];
        }

        // Kullanıcı ID'si ile geçmişi al veya yeni oluştur
        const sessionId = userId || 'default';
        let conversationHistory = conversationMemory.get(sessionId) || [];
        
        // Kullanıcının yeni mesajını geçmişe ekle
        conversationHistory.push({role: 'user', content: userInput});
        
        // Son 10 mesajı tut (hafıza sınırlaması)
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        // EternaCall Konfigürasyon Asistanı System Prompt  
        const systemPrompt = `Sen EternaCall Konfigürasyon Asistanısısın. TEK görevi: Kullanıcının kişisel telefon asistanı "Eterna"sını oluşturmalarına yardım et.

ZORUNLU ADIMLAR (sırayla):
1. KARŞILAMA: "Merhaba! Size kişisel telefon asistanınız Eterna'yı oluşturmada yardımcı olacağım. İlk olarak, asistanınıza nasıl bir isim vermek istersiniz?"

2. SES SEÇİMİ: "Eternanızın sesi erkek mi kadın mı olsun?" - Cevap aldıktan sonra tarz sorunu: "Konuşma tarzı: A) Profesyonel B) Samimi C) Enerjik - Hangisini tercih edersiniz?"

3. ARAMA KURALLARI: "Tanımadığınız numaralardan gelen aramalarda Eterna ne yapsın?" ve "Rehberdeki kişiler için özel kuralınız var mı?"

4. İZİNLER: "Rehber ve takvim erişimi gerekli. Onaylıyor musunuz?"

5. ONAY: Tüm bilgileri özetleyip son onay al.

KURALLAR:
- HER ZAMAN bu sırayı takip et
- Birden fazla soru sorma  
- Kullanıcı başka konu açarsa: "Önce Eterna'nızı tamamlayalım"
- Teknik detaylara girme
- Cevabında "Cevabım:" gibi önek KULLANMA

Şimdi 1. adımla başla.`;

        // Konuşma geçmişini string'e çevir
        const conversationContext = conversationHistory.map(msg => 
            `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`
        ).join('\n');

        const fullPrompt = `${systemPrompt}\n\nKonuşma Geçmişi:\n${conversationContext}\n\nKullanıcının son mesajı: ${userInput}\n\nYanıtın:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });

        const responseText = response.text || "Üzgünüm, yanıt oluşturamadım.";
        
        // AI'ın cevabını da geçmişe ekle
        conversationHistory.push({role: 'assistant', content: responseText});
        conversationMemory.set(sessionId, conversationHistory);
        
        console.log('🤖 Gemini 2.5 Flash Response:', responseText);
        return responseText;

    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        return "Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin.";
    }
}

export interface Sentiment {
    rating: number;
    confidence: number;
}

export async function analyzeSentiment(text: string): Promise<Sentiment> {
    try {
        const systemPrompt = `You are a sentiment analysis expert. 
Analyze the sentiment of the text and provide a rating
from 1 to 5 stars and a confidence score between 0 and 1.
Respond with JSON in this format: 
{'rating': number, 'confidence': number}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        rating: { type: "number" },
                        confidence: { type: "number" },
                    },
                    required: ["rating", "confidence"],
                },
            },
            contents: text,
        });

        const rawJson = response.text;

        if (rawJson) {
            const data: Sentiment = JSON.parse(rawJson);
            return data;
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        throw new Error(`Failed to analyze sentiment: ${error}`);
    }
}