import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveVoiceAssistantProps {
  className?: string;
}

export function InteractiveVoiceAssistant({ className }: InteractiveVoiceAssistantProps) {
  const { user } = useUser();
  const { toast } = useToast();
  
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buttonText, setButtonText] = useState("Konuşmak için Basılı Tutun");
  
  // Refs for media handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const assistantAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (assistantAudioRef.current) {
        assistantAudioRef.current.pause();
      }
    };
  }, []);

  // Start recording when button is pressed
  const startRecording = async () => {
    try {
      if (isAssistantSpeaking) {
        // Stop assistant if speaking
        stopAssistant();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setButtonText("Dinliyorum... Bırakın");
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Hata!",
        description: "Mikrofon erişimi alınamadı.",
        variant: "destructive",
      });
    }
  };

  // Stop recording when button is released
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setButtonText("İşleniyor...");
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Process the recorded audio
  const processRecording = async () => {
    try {
      if (audioChunksRef.current.length === 0) {
        setIsProcessing(false);
        setButtonText("Konuşmak için Basılı Tutun");
        return;
      }

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const response = await sendAudioToBackend(audioBlob);
      
      if (response) {
        await playAssistantResponse(response);
      }
      
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Hata!",
        description: "Ses işlenemedi. Tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setButtonText("Konuşmak için Basılı Tutun");
    }
  };

  // Send audio to backend for processing
  const sendAudioToBackend = async (audioBlob: Blob): Promise<Blob | null> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      return null;
    }
  };

  // Play assistant response and animate avatar
  const playAssistantResponse = async (audioBlob: Blob) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      assistantAudioRef.current = audio;

      audio.onloadstart = () => {
        setIsAssistantSpeaking(true);
        setButtonText("Durdurmak için Tıkla");
      };

      audio.onended = () => {
        console.log("Asistan konuşmayı bitirdi. Şimdi sıra kullanıcıda.");
        setIsAssistantSpeaking(false);
        setButtonText("Dinliyorum... Konuşun");
        URL.revokeObjectURL(audioUrl);
        
        // PDF'deki öneriye göre: Otomatik olarak dinlemeye geçiş
        setTimeout(() => {
          startRecording();
        }, 500); // Kısa bir bekleme süresi
      };

      audio.onerror = () => {
        setIsAssistantSpeaking(false);
        setButtonText("Konuşmak için Basılı Tutun");
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing assistant response:', error);
      setIsAssistantSpeaking(false);
      setButtonText("Konuşmak için Basılı Tutun");
    }
  };

  // Stop assistant speech
  const stopAssistant = () => {
    if (assistantAudioRef.current) {
      assistantAudioRef.current.pause();
      assistantAudioRef.current.currentTime = 0;
    }
    setIsAssistantSpeaking(false);
    setButtonText("Konuşmak için Basılı Tutun");
  };

  // Handle button interactions
  const handleButtonMouseDown = () => {
    if (!isProcessing) {
      startRecording();
    }
  };

  const handleButtonMouseUp = () => {
    if (isRecording) {
      stopRecording();
    } else if (isAssistantSpeaking) {
      stopAssistant();
    }
  };

  const handleButtonClick = () => {
    if (isAssistantSpeaking) {
      stopAssistant();
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[80vh] p-8", className)}>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">🤖 AI Asistanınız</CardTitle>
          <CardDescription>
            Butona basılı tutarak konuşun, asistanınız size cevap verecek
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar */}
          <div className="flex justify-center">
            <div 
              className={cn(
                "w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 transition-all duration-300 ease-in-out",
                isAssistantSpeaking && "shadow-2xl shadow-blue-500/50 scale-110 animate-pulse",
                isRecording && "shadow-lg shadow-red-500/50 scale-105",
                isProcessing && "shadow-lg shadow-yellow-500/50 animate-spin"
              )}
              data-testid="avatar-assistant"
            >
              <div className="w-full h-full rounded-full flex items-center justify-center text-white text-4xl">
                {isProcessing ? (
                  <Loader2 className="h-12 w-12 animate-spin" />
                ) : isAssistantSpeaking ? (
                  <Volume2 className="h-12 w-12" />
                ) : isRecording ? (
                  <Mic className="h-12 w-12 text-red-300" />
                ) : (
                  <MicOff className="h-12 w-12" />
                )}
              </div>
            </div>
          </div>

          {/* Control Button */}
          <div className="space-y-4">
            <Button
              size="lg"
              className={cn(
                "w-full h-16 text-lg font-semibold rounded-2xl transition-all duration-200",
                isRecording && "bg-red-500 hover:bg-red-600",
                isAssistantSpeaking && "bg-orange-500 hover:bg-orange-600",
                isProcessing && "bg-yellow-500 hover:bg-yellow-600"
              )}
              onMouseDown={handleButtonMouseDown}
              onMouseUp={handleButtonMouseUp}
              onMouseLeave={handleButtonMouseUp} // Handle case when mouse leaves button
              onClick={handleButtonClick}
              disabled={isProcessing}
              data-testid="button-voice-control"
            >
              {isRecording ? (
                <Mic className="h-5 w-5 mr-2" />
              ) : isAssistantSpeaking ? (
                <VolumeX className="h-5 w-5 mr-2" />
              ) : (
                <Mic className="h-5 w-5 mr-2" />
              )}
              {buttonText}
            </Button>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>💡 <strong>Nasıl kullanılır:</strong></p>
              <ul className="text-xs space-y-1">
                <li>• Butona basılı tutarak konuşun</li>
                <li>• Konuşmayı bitirince butonu bırakın</li>
                <li>• Asistan konuşurken durdurmak için tıklayın</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}