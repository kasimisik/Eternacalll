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

        // Optimize edilmiş sistem prompt'u (hızlı yanıt için kısaltıldı)
        const systemPrompt = `Sen EternaCall Konfigürasyon Asistanısın. Kışisel telefon asistanı "Eterna" kurulumu yapıyorsun.

ADIMLAR: 1)İsim 2)Ses&Tarz 3)Kurallar 4)İzinler 5)Onay

KURALLAR:
- Tek soru sor, kısa yanıt ver
- Başka konu açarsa: "Önce Eterna'yı tamamlayalım"
- Önek kullanma

İlk soru: "Asistanınıza nasıl isim vermek istersiniz?"`;

        // Konuşma geçmişini string'e çevir
        const conversationContext = conversationHistory.map(msg => 
            `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`
        ).join('\n');

        // Optimize edilmiş prompt yapısı (daha hızlı işlem için)
        const fullPrompt = conversationHistory.length > 0 
            ? `${systemPrompt}\n\nGeçmiş:\n${conversationContext.slice(-300)}\n\nSon mesaj: ${userInput}`
            : `${systemPrompt}\n\nKullanıcı: ${userInput}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 150,
                topK: 40,
                topP: 0.95,
            }
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