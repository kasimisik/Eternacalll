import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Volume2, Loader2 } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: { [key: string]: string };
  settings?: {
    stability: number;
    similarity_boost: number;
  };
}

interface VoiceSelectorProps {
  selectedVoiceId?: string;
  onVoiceSelect: (voiceId: string, voiceName: string) => void;
  className?: string;
}

export function VoiceSelector({ selectedVoiceId, onVoiceSelect, className }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/voices/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Sesler yüklenemedi');
      }

      setVoices(data.voices || []);
    } catch (error) {
      console.error('Voice fetch error:', error);
      setError(error instanceof Error ? error.message : 'Sesler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const playPreview = async (voice: Voice) => {
    if (!voice.preview_url) return;

    try {
      setPlayingPreview(voice.id);
      
      const audio = new Audio(voice.preview_url);
      audio.onended = () => setPlayingPreview(null);
      audio.onerror = () => setPlayingPreview(null);
      
      await audio.play();
    } catch (error) {
      console.error('Preview play error:', error);
      setPlayingPreview(null);
    }
  };

  const stopPreview = () => {
    setPlayingPreview(null);
    // Stop all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  const selectedVoice = voices.find(voice => voice.id === selectedVoiceId);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Ses Seçimi</CardTitle>
          <CardDescription>ElevenLabs'ten sesler yükleniyor...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Ses Seçimi</CardTitle>
          <CardDescription>Sesler yüklenirken hata oluştu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchVoices} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ses Seçimi</CardTitle>
        <CardDescription>
          AI ajanınız için bir ses seçin ve ses ayarlarını görüntüleyin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection Dropdown */}
        <div>
          <label htmlFor="voice-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Ses Seçin
          </label>
          <Select
            value={selectedVoiceId || ""}
            onValueChange={(value) => {
              const voice = voices.find(v => v.id === value);
              if (voice) {
                onVoiceSelect(voice.id, voice.name);
              }
            }}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Bir ses seçin..." />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center space-x-2">
                    <span>{voice.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {voice.category}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Voice Details */}
        {selectedVoice && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedVoice.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Kategori: {selectedVoice.category}
                </p>
                {selectedVoice.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedVoice.description}
                  </p>
                )}
              </div>
              
            </div>

            {/* Voice Settings */}
            {selectedVoice.settings && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-sm font-medium">Kararlılık</span>
                  <div className="text-sm text-muted-foreground">
                    {selectedVoice.settings.stability}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Benzerlik</span>
                  <div className="text-sm text-muted-foreground">
                    {selectedVoice.settings.similarity_boost}
                  </div>
                </div>
              </div>
            )}

            {/* Voice Labels/Tags */}
            {selectedVoice.labels && Object.keys(selectedVoice.labels).length > 0 && (
              <div>
                <span className="text-sm font-medium">Özellikler:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(selectedVoice.labels).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Count Info */}
        <div className="text-xs text-muted-foreground text-center">
          {voices.length} ses mevcut
        </div>
      </CardContent>
    </Card>
  );
}