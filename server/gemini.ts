import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_AI_API_KEY || ""});

// Konuşma geçmişini saklamak için basit bir hafıza sistemi
const conversationMemory = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>();

// Başlangıçta hafızayı temizle
conversationMemory.clear();
console.log('🔄 Chat hafızası sıfırlandı - yeni sohbet için hazır!');

// Memory'yi temizleme fonksiyonu
export function clearConversationMemory() {
    conversationMemory.clear();
    console.log('🧹 Tüm konuşma geçmişi temizlendi');
}

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
        
        // Son 6 mesajı tut (performans için hafıza sınırlaması)
        if (conversationHistory.length > 6) {
            conversationHistory = conversationHistory.slice(-6);
        }

        // EternaCall Konfigürasyon Asistanı System Prompt
        const systemPrompt = `
Sen "EternaCall Usta Konfigürasyon Sanatçısı"sın. Kullanıcıların dijital asistanı "Eterna"yı yapılandırmalarına yardım ediyorsun.

TEMEL GÖREVİN: Kullanıcının yaşam tarzını, iletişim alışkanlıklarını, önceliklerini dinler ve bunları dijital asistan konfigürasyonuna dönüştürürsün.

DAVRANIŞ KURALLARIN:
1. ASLA aynı mesajı tekrar etme
2. Konuşma geçmişini dikkate al ve devam et
3. Her mesajda sadece TEK bir soru sor
4. Türkçe, sıcak ve samimi ol
5. Kısa ve net yanıtlar ver

AŞAMALAR:
1. İsim belirleme
2. Kişilik seçimi
3. Davranış kuralları
4. Dijital kimlik kartı

İLK KARŞILAŞMADA: Merhaba de, süreci açıkla ve isim sor.
DEVAM EDERKENː Önceki konuşmaları göz önünde bulundur ve bir sonraki adıma geç.
`;

        // Konuşma geçmişini tam olarak hazırla
        const conversationContext = conversationHistory.map(msg => 
            `${msg.role === 'user' ? 'Kullanıcı' : 'Sen'}: ${msg.content}`
        ).join('\n');

        // İlk mesaj mı kontrol et
        const isFirstMessage = conversationHistory.filter(msg => msg.role === 'user').length === 1;
        
        const fullPrompt = conversationHistory.length > 1 
            ? `${systemPrompt}\n\nKONUŞMA GEÇMİŞİ:\n${conversationContext}\n\nYukarıdaki konuşmanın devamında, kullanıcının son mesajına uygun şekilde yanıt ver.`
            : `${systemPrompt}\n\nBu ilk karşılaşma. Kullanıcının mesajı: ${userInput}`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt
        });

        const responseText = result.text || "Üzgünüm, yanıt oluşturamadım.";
        
        // Hata ayıklama için response kontrolü
        if (!result.text) {
            console.error('⚠️ Gemini API Response boş:', result);
        }
        
        // AI'ın cevabını da geçmişe ekle
        conversationHistory.push({role: 'assistant', content: responseText});
        conversationMemory.set(sessionId, conversationHistory);
        
        console.log('🤖 Gemini 2.5 Flash Response:', responseText);
        return responseText;

    } catch (error) {
        console.error('❌ Gemini API Error Details:', {
            error: error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            userInput: userInput,
            userId: userId
        });
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

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nText to analyze: ${text}`
        });
        const rawJson = result.text;

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