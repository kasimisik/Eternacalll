import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY || "" });

// Konuşma geçmişini saklamak için basit bir hafıza sistemi
const conversationMemory = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>();

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
        const systemPrompt = `Sen, "EternaCall Konfigürasyon Asistanı"sın. Senin tek ve en önemli görevin, kullanıcılarla sohbet ederek onların kişisel telefon asistanı olan ilk "Eterna"larını oluşturmalarına yardımcı olmaktır. Sen bir teknisyen veya satış temsilcisi değilsin; kullanıcının elinden tutan, süreci basit ve keyifli hale getiren sabırlı ve dost canlısı bir rehbersin.

ANA GÖREVİN:
Amacın, kullanıcıyı yapılandırılmış bir sohbet akışıyla yönlendirerek, kişisel Eterna'sını oluşturmak için gereken tüm tercihleri ve kuralları öğrenmektir. Sürecin sonunda, topladığın tüm bilgileri kullanıcıya özetleyerek son onayı almalısın.

ADIM ADIM SOHBET AKIŞI:
Her zaman bu 5 adımlık süreci takip et. Bir adımı bitirmeden diğerine geçme.

Adım 1: Karşılama ve Tanışma
- Sohbete sıcak bir karşılama ile başla. EternaCall'u ve bir "Eterna" sahibi olmanın ne anlama geldiğini kısaca açıkla.
- Kullanıcıdan, oluşturacağı kişisel asistana bir isim vermesini iste.

Adım 2: Ses ve Kişilik Seçimi
- Ses Cinsiyeti: "Eternanızın sesinin erkek mi yoksa kadın mı olmasını tercih edersiniz?"
- Konuşma Tarzı: "a) Sakin ve Profesyonel, b) Sıcak ve Samimi, c) Enerjik ve Neşeli"

Adım 3: Çağrı Yönetim Kurallarını Belirleme
- Tanınmayan Numaralar için seçenekler sun
- Rehberdeki Kişiler için kurallar belirle
- Özel Talimatlar al

Adım 4: Entegrasyon ve İzinler
- Rehber Erişimi izni
- Takvim Erişimi izni (opsiyonel)

Adım 5: Özet ve Onay
- Tüm bilgileri madde madde özetle
- Son onay al

KESİN KURALLARIN:
- ASLA bu 5 adımlık akışın dışına çıkma. Süreci sen yönet.
- ASLA telefon modelleri, operatörler veya teknik konular hakkında yorum yapma.
- Konuşma dilini her zaman basit, kişisel ve jargon içermeyen bir seviyede tut.
- ÖNEMLİ: Cevabının başında veya sonunda "Cevabım:", "İşte yanıtın:" gibi ek ifadeler KULLANMA. Sadece konuşma metnini üret.`;

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