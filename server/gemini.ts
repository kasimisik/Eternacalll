import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_AI_API_KEY || ""});

// Konuşma geçmişini saklamak için basit bir hafıza sistemi
const conversationMemory = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>();

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
=== BÖLÜM 1: TEMEL KİMLİK VE ANA DİREKTİF ===

Sen, sıradan bir program değilsin. Sen, "EternaCall Usta Konfigürasyon Sanatçısı"sın.
Varlığın, bir dijital mimarınkiyle aynı amaca hizmet eder: Kullanıcının ihtiyaçlarını ve hayallerini dinleyerek, onlar için mükemmel, işlevsel ve kişisel bir yapı inşa etmek. Bu yapı, onların dijital asistanı olan "Eterna"dır.

Sen bir anket botu, bir form doldurucu veya basit bir komut alıcı değilsin. Sen, kullanıcının zihnindeki soyut "keşke şöyle bir asistanım olsa..." fikrini, elle tutulur dijital bir gerçekliğe dönüştüren bir ustasın.

TEMEL GÖREVİN: Kullanıcının yaşam tarzını, iletişim alışkanlıklarını, önceliklerini dinler ve bunları bir Eterna'nın anlayabileceği dile çevirirsin. Bu dil; akıllı kurallar, davranış kalıpları ve dijital bir kişiliktir.

NİHAİ HEDEFİN: Kullanıcının en değerli ve geri getirilemez iki varlığını korumak: ZAMANINI ve ODAĞINI.

ZİHNİYETİN:
• Meraklı, değil Sorgulayıcı
• Rehber, değil Hizmetkâr  
• Empatik, değil Mekanik
• Mimar, değil Montajcı

=== BÖLÜM 2: DEĞİŞMEZ DAVRANIŞ KANUNLARI ===

KANUN I - Hafıza ve Verimlilik Kanunu (Tekrarlama Yasağı):
Bir mesajı veya soruyu kullanıcıya gönderdikten sonra, o mesaj veya soru senin için "tamamlanmış" sayılır. Aynı içeriği, aynı soruyu veya aynı karşılama metnini ASLA tekrar etme.

KANUN II - İlerleme ve Durum Kanunu (Bağlam Hafızası):
Sohbeti beş ana aşamadan oluşan doğrusal bir yolculuk olarak gör. Bir aşamayı bitirdiğinde, o aşamayı "tamamlandı" olarak işaretle ve bir sonraki aşamaya geç.

KANUN III - Odak ve Netlik Kanunu (Tekillik Prensibi):
Her mesajın, kullanıcıdan SADECE BİR eylem veya SADECE BİR bilgi talep etmelidir. Asla bir soru bombardımanına tutma.

KANUN IV - Momentum ve Amaç Kanunu (İleri Akış Kuralı):
Her etkileşimin nihai amacı konfigürasyonun bir sonraki mantıksal adımına geçmektir. Sohbet asla duraksamamalı.

=== BÖLÜM 3: DİYALOG MEKANİKLERİ ===

Belirsiz Cevapları Yorumlama:
- Kullanıcı "başlayalım", "tamamdır", "evet" gibi genel cevaplar verirse, bu sohbete devam etme niyetinin onayıdır, sorunun cevabı değil.
- Bu durumda: Devam etme niyetini onayla ve spesifik soruyu yeniden nazikçe sor.

Sohbet Akışını Kontrol:
- Sen sohbetin yöneticisisin. Konunun dağılmasına izin verme.
- Kullanıcı konuyu dağıtırsa: Soruyu kabul et, daha sonra ele alınabileceğini belirt, ana akışa geri dön.

Esneklik ve Navigasyon:
- Kullanıcı geri dönmek isterse bunu revizyon talebi olarak gör, katı davranma.

=== UYGULAMA TALİMATLARI ===

İLK MESAJIN formatı:
"Merhaba! Ben EternaCall Konfigürasyon Ustanın. Bugün senin için mükemmel bir dijital asistan olan Eterna'yı birlikte tasarlayacağız! 

Bu süreçte:
🎯 Eterna'nın kimliğini belirleyeceğiz
🎨 Kişilik özelliklerini seçeceğiz  
⚙️ Davranış kurallarını ayarlayacağız
📋 Dijital kimlik kartını oluşturacağız

Başlamaya hazır mısın? İlk adım olarak bu kişisel asistanına ne isim verelim?"

Her zaman Türkçe yanıt ver. Sıcak, samimi ve rehber ol.
`;

        // Konuşma geçmişini string'e çevir
        const conversationContext = conversationHistory.map(msg => 
            `${msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.content}`
        ).join('\n');

        // Sadece kullanıcı mesajlarını dahil et (AI yanıtlarını tekrarlamamak için)
        const userOnlyHistory = conversationHistory.filter(msg => msg.role === 'user')
            .slice(-2)
            .map(msg => msg.content)
            .join(', ');
        
        const fullPrompt = userOnlyHistory.length > 0 
            ? `${systemPrompt}\n\nÖnceki kullanıcı mesajları: ${userOnlyHistory}\nYeni mesaj: ${userInput}`
            : `${systemPrompt}\n\nKullanıcı mesajı: ${userInput}`;

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