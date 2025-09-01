import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VoiceSelector } from './VoiceSelector';
import { VoiceCloner } from './VoiceCloner';
import { Loader2, Bot, Phone, AlertCircle, Check, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AgentCreatorProps {
  onAgentCreated?: (agent: any) => void;
  className?: string;
}

export function AgentCreator({ onAgentCreated, className }: AgentCreatorProps) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [stability, setStability] = useState([0.7]);
  const [similarityBoost, setSimilarityBoost] = useState([0.8]);
  const [firstMessage, setFirstMessage] = useState('Merhaba! Size nasıl yardımcı olabilirim?');
  const [language, setLanguage] = useState('tr');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAgent, setCreatedAgent] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Ajan ismi gereklidir');
      return;
    }

    if (!prompt.trim()) {
      setError('Sistem promptu gereklidir');
      return;
    }

    if (!voiceId) {
      setError('Bir ses seçmeniz gerekiyor');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const agentData = {
        name: name.trim(),
        prompt: prompt.trim(),
        voice_id: voiceId,
        stability: stability[0],
        similarity_boost: similarityBoost[0],
        first_message: firstMessage.trim(),
        language: language,
      };

      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Ajan oluşturma işlemi başarısız');
      }

      setCreatedAgent(data.agent);
      
      // Call callback if provided
      if (onAgentCreated) {
        onAgentCreated(data.agent);
      }

      toast({
        title: "Başarılı!",
        description: "AI Ajan başarıyla oluşturuldu.",
      });

    } catch (error) {
      console.error('Agent creation error:', error);
      setError(error instanceof Error ? error.message : 'Ajan oluşturma işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCloned = (newVoiceId: string, newVoiceName: string) => {
    setVoiceId(newVoiceId);
    setVoiceName(newVoiceName);
    toast({
      title: "Ses Klonlandı!",
      description: `${newVoiceName} sesi başarıyla oluşturuldu ve seçildi.`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı!",
      description: "Metin panoya kopyalandı.",
    });
  };

  const resetForm = () => {
    setName('');
    setPrompt('');
    setVoiceId('');
    setVoiceName('');
    setStability([0.7]);
    setSimilarityBoost([0.8]);
    setFirstMessage('Merhaba! Size nasıl yardımcı olabilirim?');
    setLanguage('tr');
    setError(null);
    setCreatedAgent(null);
  };

  // If agent was just created, show success screen
  if (createdAgent) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-600" />
            AI Ajan Başarıyla Oluşturuldu!
          </CardTitle>
          <CardDescription>
            Ajanınız hazır ve telefon çağrılarını almaya başlayabilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <Label className="text-sm font-medium">Ajan Adı</Label>
              <p className="text-sm text-muted-foreground">{createdAgent.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Ses</Label>
              <p className="text-sm text-muted-foreground">{voiceName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Kararlılık</Label>
              <p className="text-sm text-muted-foreground">{createdAgent.stability}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Benzerlik</Label>
              <p className="text-sm text-muted-foreground">{createdAgent.similarity_boost}</p>
            </div>
          </div>

          {/* Phone Endpoint */}
          <div>
            <Label className="text-sm font-medium">Telefon Endpoint URL'si</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                value={createdAgent.phone_endpoint}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(createdAgent.phone_endpoint)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bu URL'yi telefon numarası sağlayıcınızın SIP trunk ayarlarında kullanın.
            </p>
          </div>

          {/* Agent Prompt Preview */}
          <div>
            <Label className="text-sm font-medium">Sistem Promptu</Label>
            <div className="mt-2 p-3 border rounded-lg bg-muted/30">
              <p className="text-xs whitespace-pre-wrap">{createdAgent.prompt}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button onClick={resetForm} variant="outline">
              Yeni Ajan Oluştur
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Dashboard'a Git
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          AI Telefon Ajanı Oluştur
        </CardTitle>
        <CardDescription>
          ElevenLabs kullanarak kendi sesli AI ajanınızı oluşturun. 
          Ajan, gelen telefon çağrılarını otomatik olarak karşılayacak.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Name */}
          <div className="space-y-2">
            <Label htmlFor="agent-name">Ajan Adı *</Label>
            <Input
              id="agent-name"
              placeholder="Örn: Restoran Rezervasyon Asistanı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="agent-prompt">Sistem Promptu *</Label>
            <Textarea
              id="agent-prompt"
              placeholder="Sen dost canlısı bir restoran resepsiyonistisin. Müşterilerin rezervasyon yapmalarına yardımcı oluyorsun..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ajanın nasıl davranması gerektiğini detaylıca açıklayın.
            </p>
          </div>

          {/* First Message */}
          <div className="space-y-2">
            <Label htmlFor="first-message">İlk Karşılama Mesajı</Label>
            <Input
              id="first-message"
              placeholder="Merhaba! Size nasıl yardımcı olabilirim?"
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Voice Settings */}
          <Tabs defaultValue="select" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Var Olan Ses Seç</TabsTrigger>
              <TabsTrigger value="clone">Özel Ses Oluştur</TabsTrigger>
            </TabsList>
            <TabsContent value="select">
              <VoiceSelector
                selectedVoiceId={voiceId}
                onVoiceSelect={(id, name) => {
                  setVoiceId(id);
                  setVoiceName(name);
                }}
              />
            </TabsContent>
            <TabsContent value="clone">
              <VoiceCloner onVoiceCloned={handleVoiceCloned} />
            </TabsContent>
          </Tabs>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <Label>İnce Ayarlar</Label>
            
            {/* Stability */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="stability">Kararlılık</Label>
                <span className="text-sm text-muted-foreground">{stability[0]}</span>
              </div>
              <Slider
                id="stability"
                value={stability}
                onValueChange={setStability}
                max={1}
                min={0}
                step={0.1}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Düşük değerler daha yaratıcı, yüksek değerler daha tutarlı sonuçlar verir.
              </p>
            </div>

            {/* Similarity Boost */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="similarity">Benzerlik Artırma</Label>
                <span className="text-sm text-muted-foreground">{similarityBoost[0]}</span>
              </div>
              <Slider
                id="similarity"
                value={similarityBoost}
                onValueChange={setSimilarityBoost}
                max={1}
                min={0}
                step={0.1}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Sesin orijinale ne kadar benzer olacağını kontrol eder.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading || !name.trim() || !prompt.trim() || !voiceId}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI Ajan Oluşturuluyor...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                AI Ajan Oluştur
              </>
            )}
          </Button>

          {/* Info Box */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 border rounded-lg bg-muted/30">
            <p className="font-medium">📞 Telefon Entegrasyonu:</p>
            <p>• Ajan oluşturulduktan sonra telefon endpoint URL'sini alacaksınız</p>
            <p>• Bu URL'yi telefon sağlayıcınızın SIP trunk ayarlarında kullanın</p>
            <p>• Gelen çağrılar otomatik olarak ElevenLabs'e yönlendirilecek</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}