import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Users, 
  Palette, 
  Volume2, 
  Settings, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Play,
  Pause,
  Phone
} from 'lucide-react';

interface InteractiveAgentCreatorProps {
  onAgentCreated?: (agent: any) => void;
  className?: string;
}

interface UserPreferences {
  currentStep: number;
  agentPurpose?: string;
  targetAudience?: string;
  agentPersona?: string;
  chosenVoiceId?: string;
  chosenVoiceName?: string;
  userProfession?: string;
  userHobbies?: string;
  preferredLanguage: string;
}

interface VoiceOption {
  id: string;
  name: string;
  language: string;
  accent?: string;
  gender?: string;
}

export function InteractiveAgentCreator({ onAgentCreated, className }: InteractiveAgentCreatorProps) {
  const { user } = useUser();
  const { toast } = useToast();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    currentStep: 1,
    preferredLanguage: 'tr'
  });
  
  // Step-specific states
  const [agentPurpose, setAgentPurpose] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [userProfession, setUserProfession] = useState('');
  const [userHobbies, setUserHobbies] = useState('');
  const [suggestedPersona, setSuggestedPersona] = useState('');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<any>(null);

  // Load user preferences on component mount
  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
    }
  }, [user?.id]);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        headers: {
          'x-user-id': user?.id || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
          setCurrentStep(data.preferences.currentStep || 1);
          // Restore form data if exists
          if (data.preferences.agentPurpose) setAgentPurpose(data.preferences.agentPurpose);
          if (data.preferences.targetAudience) setTargetAudience(data.preferences.targetAudience);
          if (data.preferences.userProfession) setUserProfession(data.preferences.userProfession);
          if (data.preferences.userHobbies) setUserHobbies(data.preferences.userHobbies);
          if (data.preferences.agentPersona) setSuggestedPersona(data.preferences.agentPersona);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveProgress = async (step: number, data: Partial<UserPreferences>) => {
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          currentStep: step,
          ...data,
        }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const generatePersonaSuggestion = (profession: string, hobbies: string) => {
    let persona = '';
    
    if (profession.toLowerCase().includes('doktor') || profession.toLowerCase().includes('hekim')) {
      persona = 'profesyonel, güven verici ve sakin';
    } else if (profession.toLowerCase().includes('öğretmen') || profession.toLowerCase().includes('eğitim')) {
      persona = 'açıklayıcı, sabırlı ve destekleyici';
    } else if (profession.toLowerCase().includes('mühendis')) {
      persona = 'analitik, detaycı ve çözüm odaklı';
    } else if (profession.toLowerCase().includes('müzik') || hobbies.toLowerCase().includes('müzik')) {
      persona = 'yaratıcı, enerjik ve esprili';
    } else if (profession.toLowerCase().includes('satış')) {
      persona = 'ikna edici, enerjik ve samimi';
    } else if (profession.toLowerCase().includes('avukat')) {
      persona = 'mantıklı, kesin ve güvenilir';
    } else {
      persona = 'dostane, profesyonel ve yardımsever';
    }
    
    return persona;
  };

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/voices/list');
      const data = await response.json();
      
      if (data.success && data.voices) {
        // Filter Turkish voices
        const turkishVoices = data.voices.filter((voice: any) => 
          voice.language && (voice.language.includes('tr') || voice.language.includes('turkish'))
        ).slice(0, 5); // Limit to 5 options
        
        setVoices(turkishVoices.map((voice: any) => ({
          id: voice.id,
          name: voice.name,
          language: voice.language,
          accent: voice.accent,
          gender: voice.gender
        })));
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      toast({
        title: "Hata!",
        description: "Sesler yüklenirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const previewVoice = async (voice: VoiceOption) => {
    try {
      setIsPlayingPreview(true);
      
      const response = await fetch('/api/voices/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceId: voice.id,
          text: `Merhaba, ben sizin potansiyel asistanınızım. Bu ses tonu, tasarladığınız ${agentPurpose} için size uygun geliyor mu?`,
          language: 'tr'
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlayingPreview(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        throw new Error('Ses önizlemesi oluşturulamadı');
      }
    } catch (error) {
      console.error('Error previewing voice:', error);
      setIsPlayingPreview(false);
      toast({
        title: "Hata!",
        description: "Ses önizlemesi oynatılamadı.",
        variant: "destructive",
      });
    }
  };

  const nextStep = async () => {
    let stepData: Partial<UserPreferences> = {};
    
    if (currentStep === 1) {
      if (!agentPurpose.trim() || !targetAudience.trim()) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen tüm alanları doldurun.",
          variant: "destructive",
        });
        return;
      }
      stepData = { agentPurpose, targetAudience };
    } else if (currentStep === 2) {
      if (!userProfession.trim()) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen mesleğinizi belirtin.",
          variant: "destructive",
        });
        return;
      }
      const persona = generatePersonaSuggestion(userProfession, userHobbies);
      setSuggestedPersona(persona);
      stepData = { userProfession, userHobbies, agentPersona: persona };
    } else if (currentStep === 3) {
      if (!selectedVoice) {
        toast({
          title: "Ses Seçimi Gerekli",
          description: "Lütfen bir ses seçin.",
          variant: "destructive",
        });
        return;
      }
      stepData = { chosenVoiceId: selectedVoice.id, chosenVoiceName: selectedVoice.name };
    }
    
    const nextStepNumber = currentStep + 1;
    await saveProgress(nextStepNumber, stepData);
    setCurrentStep(nextStepNumber);
    
    // Load voices when entering step 3
    if (nextStepNumber === 3) {
      await loadVoices();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createAgent = async () => {
    try {
      setLoading(true);

      const agentData = {
        name: `${user?.firstName || 'Kullanıcı'} Asistanı`,
        prompt: `Sen bir ${suggestedPersona} AI asistanısın. Görevin: ${agentPurpose}. Hedef kitle: ${targetAudience}. Her zaman ${suggestedPersona} bir şekilde konuş ve yardımcı ol.`,
        voice_id: selectedVoice?.id,
        voice_name: selectedVoice?.name,
        stability: 0.7,
        similarity_boost: 0.8,
        first_message: 'Merhaba! Size nasıl yardımcı olabilirim?',
        language: 'tr',
        agent_purpose: agentPurpose,
        agent_persona: suggestedPersona,
      };

      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(agentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ajan oluşturma işlemi başarısız');
      }

      setCreatedAgent(data.agent);
      
      // Clear preferences after successful creation
      await fetch('/api/user/preferences', {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || '',
        },
      });

      if (onAgentCreated) {
        onAgentCreated(data.agent);
      }

      toast({
        title: "Başarılı!",
        description: "AI Asistanınız başarıyla oluşturuldu!",
      });

    } catch (error) {
      console.error('Agent creation error:', error);
      toast({
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Ajan oluşturma işlemi başarısız',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If agent was successfully created, show success screen
  if (createdAgent) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-600" />
            🎉 Harika! AI Asistanınız Hazır!
          </CardTitle>
          <CardDescription>
            {user?.firstName || 'Kullanıcı'} tarafından tasarlanan, {selectedVoice?.name} sesine sahip, 
            {suggestedPersona} kişiliğindeki asistanınız aramaları yanıtlamaya hazır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
            <h3 className="font-semibold mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Telefon Entegrasyonu
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Telefon Endpoint URL'si</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={createdAgent.phone_endpoint}
                    readOnly
                    className="font-mono text-xs bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(createdAgent.phone_endpoint)}
                  >
                    Kopyala
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Şimdi yapmanız gerekenler:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Twilio'ya kaydolup bir telefon numarası alın</li>
                  <li>'Account SID' ve 'Auth Token' bilgilerinizi edinin</li>
                  <li>Bu bilgileri Replit projenizdeki 'Secrets' bölümüne ekleyin</li>
                  <li>Yukarıdaki URL'yi Twilio webhook ayarlarında kullanın</li>
                </ol>
                <p className="text-amber-600 font-medium">
                  ⚠️ Güvenlik: API anahtarlarınızı asla paylaşmayın!
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => {
              setCreatedAgent(null);
              setCurrentStep(1);
              setAgentPurpose('');
              setTargetAudience('');
              setUserProfession('');
              setUserHobbies('');
              setSuggestedPersona('');
              setSelectedVoice(null);
            }}
            className="w-full"
          >
            Yeni Asistan Oluştur
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Merhaba, {user?.firstName || 'Kullanıcı'}! 👋
              </h3>
              <p className="text-muted-foreground">
                Bugün birlikte size özel bir AI sesli asistanı tasarlayacağız. Başlamak için sabırsızlanıyorum!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="purpose">Bu asistanın temel görevi ne olacak?</Label>
                <Textarea
                  id="purpose"
                  placeholder="Örneğin: Randevuları yöneten bir sanal resepsiyonist, günlük görevleri hatırlatan kişisel yardımcı, müşteri sorularını yanıtlayan destek asistanı..."
                  value={agentPurpose}
                  onChange={(e) => setAgentPurpose(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="audience">Bu asistan kiminle konuşacak?</Label>
                <Input
                  id="audience"
                  placeholder="Örneğin: Sadece benimle, müşterilerimle, ailemdeki herkesle..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Harika! Şimdi asistanınıza bir kişilik verelim</h3>
              <p className="text-muted-foreground">
                Bize biraz kendinizden bahseder misiniz? Bu, asistanınızın konuşma tarzını belirlememize yardımcı olacak.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="profession">Ne iş yapıyorsunuz?</Label>
                <Input
                  id="profession"
                  placeholder="Örneğin: Diş hekimi, öğretmen, mühendis, müzisyen..."
                  value={userProfession}
                  onChange={(e) => setUserProfession(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="hobbies">Hobileriniz nelerdir? (İsteğe bağlı)</Label>
                <Input
                  id="hobbies"
                  placeholder="Örneğin: Müzik dinlemek, kitap okumak, spor yapmak..."
                  value={userHobbies}
                  onChange={(e) => setUserHobbies(e.target.value)}
                  className="mt-2"
                />
              </div>

              {suggestedPersona && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Önerilen kişilik:</strong> {suggestedPersona}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Bu kişilik, mesleğinize göre önerildi. Sonraki adımda ses seçimi yapacağız.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ses Seçimi Zamanı! 🎤</h3>
              <p className="text-muted-foreground">
                Asistanınızın Türkçe konuşmasını istediğinizi varsayıyorum. Aşağıdaki seslerden birini seçin ve önizleyin.
              </p>
            </div>

            <div className="space-y-3">
              {voices.map((voice) => (
                <div 
                  key={voice.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent/50 ${
                    selectedVoice?.id === voice.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedVoice(voice)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{voice.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {voice.gender && `${voice.gender === 'male' ? 'Erkek' : 'Kadın'} ses`}
                        {voice.accent && ` • ${voice.accent}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        previewVoice(voice);
                      }}
                      disabled={isPlayingPreview}
                    >
                      {isPlayingPreview ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {selectedVoice && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ <strong>{selectedVoice.name}</strong> seçildi. Bu ses {agentPurpose} için uygun mu?
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Harika! Son Adım 🎯</h3>
              <p className="text-muted-foreground">
                Asistanınızın amacını, kişiliğini ve sesini belirledik. 
                Şimdi onu hayata geçirmek için son bir adım kaldı: telefon hattına bağlamak.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">Asistan Özeti</h4>
                <div className="space-y-2 text-sm text-amber-700">
                  <p><strong>Görev:</strong> {agentPurpose}</p>
                  <p><strong>Hedef Kitle:</strong> {targetAudience}</p>
                  <p><strong>Kişilik:</strong> {suggestedPersona}</p>
                  <p><strong>Ses:</strong> {selectedVoice?.name}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Telefon Entegrasyonu İçin</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>Twilio gibi bir servise ihtiyacınız olacak. Bu servisler size bir telefon numarası sağlar ve gelen aramaları bizim sistemimize yönlendirir.</p>
                  <p><strong>Yapmanız gerekenler:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Twilio'ya kaydolup bir telefon numarası alın</li>
                    <li>'Account SID' ve 'Auth Token' bilgilerinizi alın</li>
                    <li>Bu bilgileri Replit projenizdeki 'Secrets' bölümüne ekleyin</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Güvenlik Uyarısı</h4>
                <p className="text-sm text-red-700">
                  API anahtarlarınızı KESİNLİKLE benimle veya başkasıyla paylaşmayın. 
                  Bu bilgileri Replit projenizdeki 'Secrets' bölümüne eklemeniz gerekiyor.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Asistan Yaratma Rehberi</span>
          <span className="text-sm font-normal text-muted-foreground">
            {currentStep}/4
          </span>
        </CardTitle>
        <CardDescription>
          Adım adım kişiselleştirilmiş AI asistanınızı oluşturun
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step ? <Check className="h-4 w-4" /> : step}
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Önceki
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={nextStep}>
              Sonraki
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={createAgent} disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Asistanı Oluştur'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}