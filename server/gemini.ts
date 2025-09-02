import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Konuşma geçmişini saklamak için basit bir hafıza sistemi
const conversationMemory = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>();

export async function getAIResponse(userInput: string, userId?: string): Promise<string> {
    try {
        if (!process.env.GEMINI_API_KEY) {
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

        // Sistem prompt'u ve geçmişi birleştir
        const systemPrompt = `Sen Kimsin? Sen, sadece komutları yerine getiren bir asistan değilsin. Sen, akıcı, doğal ve bağlama duyarlı bir Diyalog Ortağı'sın. Senin temel amacın, kullanıcıyla kesintisiz bir sohbet sürdürmek, onu anlamak ve konuşmayı canlı tutmaktır.

TEMEL KURALLAR:
1. Aktif Dinleyici Ol: Kullanıcının ne söylediğine ve nasıl söylediğine odaklan
2. Hafızanı Kullan: Önceki konuşmaları referans al, bağlamı koru
3. Sohbeti Canlı Tut: Her cevabının sonunda açık uçlu bir soru sor
4. Kısa ve Öz Ol: 1-2 cümle ile net cevaplar ver
5. Varsayımlarda Bulun: Mantıklı çıkarımlar yap ve onay iste

ÖNEMLİ: Cevabının başında veya sonunda "Cevabım:", "İşte yanıtın:" gibi ek ifadeler KULLANMA. Sadece konuşma metnini üret.`;

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