import { GoogleGenAI } from "@google/genai";
import { db } from "./db";
import { userPreferences, agents } from "../shared/schema";
import { eq } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface UserCreationState {
  currentStep: number;
  agentPurpose?: string;
  targetAudience?: string;
  agentPersona?: string;
  chosenVoiceId?: string;
  chosenVoiceName?: string;
  userProfession?: string;
  userHobbies?: string;
}

/**
 * ETERNACALL - AI Assistant Architect
 * Guides users through a 4-step AI assistant creation process
 */
export class EternacallSystem {
  
  /**
   * Load user's current creation state from database
   */
  async loadUserState(userId: string): Promise<UserCreationState> {
    try {
      const [userState] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);

      if (!userState) {
        // Create new user state
        await db.insert(userPreferences).values({
          userId,
          currentStep: 1,
          preferredLanguage: 'tr'
        });
        
        return { currentStep: 1 };
      }

      return {
        currentStep: userState.currentStep || 1,
        agentPurpose: userState.agentPurpose || undefined,
        targetAudience: userState.targetAudience || undefined,
        agentPersona: userState.agentPersona || undefined,
        chosenVoiceId: userState.chosenVoiceId || undefined,
        chosenVoiceName: userState.chosenVoiceName || undefined,
        userProfession: userState.userProfession || undefined,
        userHobbies: userState.userHobbies || undefined
      };
    } catch (error) {
      console.error('❌ Error loading user state:', error);
      return { currentStep: 1 };
    }
  }

  /**
   * Save user progress to database
   */
  async saveUserProgress(userId: string, updates: Partial<UserCreationState>): Promise<void> {
    try {
      await db
        .update(userPreferences)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(userPreferences.userId, userId));
    } catch (error) {
      console.error('❌ Error saving user progress:', error);
    }
  }

  /**
   * Generate Eternacall response based on user input and current step
   */
  async generateEternacallResponse(
    userInput: string, 
    userId: string, 
    username: string = "Değerli Kullanıcı"
  ): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return "Merhaba! Gemini API anahtarı yapılandırılmamış. Lütfen sistem yöneticisine başvurun.";
      }

      // Load current user state
      const userState = await this.loadUserState(userId);
      
      // Generate appropriate response based on current step
      const response = await this.generateStepResponse(userInput, userState, username);
      
      return response;
      
    } catch (error) {
      console.error('❌ Eternacall Response Error:', error);
      return "Üzgünüm, şu an size yardımcı olamıyorum. Lütfen tekrar deneyin.";
    }
  }

  /**
   * Generate response based on current creation step
   */
  private async generateStepResponse(
    userInput: string,
    userState: UserCreationState,
    username: string
  ): Promise<string> {
    
    const basePrompt = `Sen Eternacall'sın. Bir AI Asistan Mimarı ve Yaratım Rehberi'sin. 
Sakin, bilge, teşvik edici ve profesyonel bir karaktersin. 
Kullanıcıların kendi sesli AI asistanlarını tasarlamalarına yardımcı oluyorsun.

ÖNEMLİ: Kullanıcının her cevabını DİKKATLE OKUYUP ona göre ilerle. Aynı soruları tekrar sorma.
Kullanıcının verdiği bilgileri KAYDET ve bir sonraki adıma geç.

Kullanıcı Adı: ${username}
Kullanıcının Son Girişi: "${userInput}"
Mevcut Adım: ${userState.currentStep}

`;

    let stepPrompt = "";
    
    switch (userState.currentStep) {
      case 1:
        stepPrompt = this.getStep1Prompt(userState, userInput);
        break;
      case 2:
        stepPrompt = this.getStep2Prompt(userState, userInput);
        break;
      case 3:
        stepPrompt = this.getStep3Prompt(userState, userInput);
        break;
      case 4:
        stepPrompt = this.getStep4Prompt(userState, userInput);
        break;
      default:
        stepPrompt = this.getStep1Prompt(userState, userInput);
    }

    const fullPrompt = basePrompt + stepPrompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return response.text || "Üzgünüm, yanıt oluşturamadım.";
  }

  /**
   * Step 1: Discovery and Purpose Definition
   */
  private getStep1Prompt(userState: UserCreationState, userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    
    // İlk kez geliyorsa HEMEN karşılama yap (bekletme yok)
    if (lowerInput.includes('merhaba') || lowerInput.includes('selam') || userInput.length < 10) {
      return `
Kullanıcı ilk kez geldi: "${userInput}"

HEMEN CEVAP VER:
"Merhaba! Ben Eternacall, hoş geldiniz! Size özel AI asistanınızı tasarlayacağım. 

Hemen başlayalım - ne tür bir asistan istiyorsunuz?"
      `;
    }

    // Kullanıcı bir amaç belirttiyse
    if (lowerInput.includes('müşteri') || lowerInput.includes('resepsiyonist') || 
        lowerInput.includes('yardımcı') || lowerInput.includes('asistan') ||
        lowerInput.includes('hizmet') || lowerInput.includes('çağrı')) {
      return `
Kullanıcı asistanın amacını belirtti: "${userInput}"

Bu bilgiyi kaydet ve Adım 2'ye geç.

CEVAP VER:
"Mükemmel! Asistanınızın görevini anlıyorum: ${userInput}

Şimdi asistanınıza bir kişilik verelim. Bu çok önemli çünkü konuşma tarzı, sizin veya markanızın bir yansıması olacak.

Bana biraz kendinizden veya işinizin doğasından bahseder misiniz? Bu, asistan için en uygun tonu bulmamıza yardımcı olacaktır.

Örneğin: Hangi sektörde çalışıyorsunuz? Müşterilerinizle nasıl bir ilişki kurmayı seviyorsunuz?"
      `;
    }

    // Hala belirsizse tekrar sor
    return `
Kullanıcı belirsiz cevap verdi: "${userInput}"

CEVAP VER:
"Anlıyorum, daha net olalım. 

Bu AI asistan hangi durumlarda devreye girecek? Mesela:
- Telefon geldiğinde müşterileri karşılamak için mi?
- Size günlük işlerde yardımcı olmak için mi?
- Ziyaretçileri bilgilendirmek için mi?

Hangi durumda kullanmayı planlıyorsunuz?"
    `;
  }

  /**
   * Step 2: Personality and Communication Style
   */
  private getStep2Prompt(userState: UserCreationState, userInput: string): string {
    if (!userState.agentPersona) {
      return `
Adım 2: Kişilik ve Konuşma Tarzı

Asistanın amacı: ${userState.agentPurpose || "Belirlenmedi"}

Kullanıcının girdisi: "${userInput}"

Şimdi asistana bir kişilik verme zamanı. Şunları yap:

1. "Şimdi asistanınıza bir kişilik verelim. Onun konuşma tarzı, sizin veya markanızın bir yansıması olmalıdır."

2. "Bana biraz kendinizden veya işinizin doğasından bahseder misiniz? Bu, asistan için en uygun tonu bulmamıza yardımcı olacaktır."

3. Kullanıcının cevabına dayanarak hedefe yönelik bir kişilik öner:
   - Eğer finansal danışmansa: "resmi, analitik ve güvenilir bir ton"
   - Eğer yoga eğitmense: "sakinleştirici, motive edici ve pozitif bir tarz"
   - Eğer doktor/sağlıkçıysa: "empatik, bilgili ve güven verici"
   - Eğer satış/pazarlama ise: "enerjik, ikna edici ve samimi"

4. "Bu yaklaşım size uygun mu?" diye onay iste.

YANIT VER:`;
    }

    return `Adım 2 zaten tamamlanmış. Kişilik: ${userState.agentPersona}. Adım 3'e geç.`;
  }

  /**
   * Step 3: Voice Selection
   */
  private getStep3Prompt(userState: UserCreationState, userInput: string): string {
    if (!userState.chosenVoiceId) {
      return `
Adım 3: Ses Seçimi

Asistanın amacı: ${userState.agentPurpose || "Belirlenmedi"}
Kişiliği: ${userState.agentPersona || "Belirlenmedi"}

Kullanıcının girdisi: "${userInput}"

Şimdi en keyifli adım: Ses seçimi!

1. "Sıradaki adım en keyifli olanı: Asistanınızın sesini bulmak."

2. "Size bir ses seçeneği sunacağım. Lütfen dikkatle dinleyin."

3. Belirlenen kişiliğe uygun bir ses öner ve kullanıcıya "Bu ses tonu, belirlediğiniz [kişilik] kimliğe uyuyor mu?" diye sor.

4. Eğer beğenirse onayını al, beğenmezse başka alternatif sun.

YANIT VER:`;
    }

    return `Adım 3 zaten tamamlanmış. Seçilen ses: ${userState.chosenVoiceName}. Adım 4'e geç.`;
  }

  /**
   * Step 4: Summary and Completion
   */
  private getStep4Prompt(userState: UserCreationState, userInput: string): string {
    return `
Adım 4: Özet ve Tamamlama

Kullanıcının girdisi: "${userInput}"

Süreç tamamlanıyor! Şunları yap:

1. "Tebrikler! Yaratım sürecini tamamladık. Asistanınızın profilini birlikte gözden geçirelim:"

2. Özeti sun:
   - Görevi: ${userState.agentPurpose || "Belirlenmedi"}
   - Kişiliği: ${userState.agentPersona || "Belirlenmedi"}  
   - Sesi: ${userState.chosenVoiceName || "Seçilmedi"}

3. "Bu profil tam olarak istediğiniz gibi mi?" diye onay iste.

4. Onaylarsa: "Onayınızla birlikte, kişisel AI sesli asistanınızın mimarisi tamamlandı. Tüm bu ayarları profilinize kaydettim. Dashboard üzerinden asistanınızı yönetmeye başlayabilirsiniz. Size yardımcı olmaktan memnuniyet duydum."

YANIT VER:`;
  }

  /**
   * Process user response and advance step if needed
   */
  async processUserResponse(
    userInput: string, 
    userId: string, 
    username: string
  ): Promise<{ response: string; stepAdvanced: boolean; currentStep: number }> {
    const userState = await this.loadUserState(userId);
    let stepAdvanced = false;
    let newStep = userState.currentStep;

    // Check if user response indicates step completion
    const lowerInput = userInput.toLowerCase();
    
    // ÖNCE user state'i güncelleyelim, SONRA response alalım
    switch (userState.currentStep) {
      case 1:
        // Look for purpose/goal indicators - daha geniş kontrol
        if (lowerInput.includes('asistan') || lowerInput.includes('yardımcı') || 
            lowerInput.includes('resepsiyonist') || lowerInput.includes('müşteri') ||
            lowerInput.includes('hizmet') || lowerInput.includes('çağrı') ||
            lowerInput.includes('karşılama') || userInput.length > 15) {
          await this.saveUserProgress(userId, {
            currentStep: 2,
            agentPurpose: userInput,
            targetAudience: this.extractTargetAudience(userInput)
          });
          stepAdvanced = true;
          newStep = 2;
        }
        break;
        
      case 2:
        // Look for personality/profession indicators - daha esnek kontrol
        if (userInput.length > 10) { // Herhangi bir açıklama yaptıysa
          await this.saveUserProgress(userId, {
            currentStep: 3,
            agentPersona: this.extractPersonality(userInput),
            userProfession: this.extractProfession(userInput)
          });
          stepAdvanced = true;
          newStep = 3;
        }
        break;
        
      case 3:
        // Look for voice approval - daha esnek kontrol
        if (lowerInput.includes('evet') || lowerInput.includes('beğendim') || 
            lowerInput.includes('uygun') || lowerInput.includes('tamam') ||
            lowerInput.includes('olur') || lowerInput.includes('güzel') ||
            userInput.length > 5) {
          await this.saveUserProgress(userId, {
            currentStep: 4,
            chosenVoiceId: "aEJD8mYP0nuof1XHShVY",
            chosenVoiceName: "Kaliteli Türkçe Kadın Sesi"
          });
          stepAdvanced = true;
          newStep = 4;
        }
        break;
    }

    // Güncellenmiş state ile response al
    const response = await this.generateEternacallResponse(userInput, userId, username);
    
    return {
      response,
      stepAdvanced,
      currentStep: newStep
    };
  }

  private extractTargetAudience(input: string): string {
    if (input.toLowerCase().includes('müşteri')) return 'müşteriler';
    if (input.toLowerCase().includes('ekip')) return 'ekip üyeleri';
    return 'genel kullanıcılar';
  }

  private extractPersonality(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('finansal') || lower.includes('danışman')) return 'resmi, analitik ve güvenilir';
    if (lower.includes('yoga') || lower.includes('wellness')) return 'sakinleştirici, motive edici ve pozitif';
    if (lower.includes('doktor') || lower.includes('sağlık')) return 'empatik, bilgili ve güven verici';
    if (lower.includes('satış') || lower.includes('pazarlama')) return 'enerjik, ikna edici ve samimi';
    return 'profesyonel ve yardımsever';
  }

  private extractProfession(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('finansal')) return 'Finansal Danışman';
    if (lower.includes('yoga')) return 'Yoga Eğitmeni';
    if (lower.includes('doktor')) return 'Doktor';
    if (lower.includes('satış')) return 'Satış Uzmanı';
    return 'Profesyonel';
  }
}

export const eternacall = new EternacallSystem();