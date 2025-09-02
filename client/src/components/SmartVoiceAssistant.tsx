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
  Loader2,
  Phone,
  PhoneOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

// VAD import - Bu real-time konuşma için kritik
import { MicVAD, utils } from '@ricky0123/vad-web';

interface SmartVoiceAssistantProps {
  className?: string;
  onClose?: () => void;
}

export function SmartVoiceAssistant({ className, onClose }: SmartVoiceAssistantProps) {
  const { user } = useUser();
  const { toast } = useToast();
  
  // State management for real-time conversation
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("Görüşmeyi Başlat");
  const [conversationHistory, setConversationHistory] = useState<Array<{user: string, assistant: string}>>([]);
  
  // Refs for VAD and media handling
  const vadRef = useRef<MicVAD | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const assistantAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, []);

  // Initialize VAD system for real-time speech detection
  const initializeVAD = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // PDF'de belirtilen VAD sistemi - kullanıcı ne zaman sustuğunu algılar
      const vad = await MicVAD.new({
        stream: stream,
        onSpeechStart: () => {
          console.log("VAD: Kullanıcı konuşmaya başladı");
          setIsListening(true);
          setStatusText("Dinliyorum...");
          startRecording();
        },
        onSpeechEnd: () => {
          console.log("VAD: Kullanıcı sustu - kayıt anında durduruluyor");
          setIsListening(false);
          setStatusText("İşleniyor...");
          stopRecording();
        },
        onVADMisfire: () => {
          console.log("VAD: Yanlış algılama, devam ediliyor");
        },
        positiveSpeechThreshold: 0.6, // Daha hassas algılama
        negativeSpeechThreshold: 0.2,
        preSpeechPadFrames: 10, // Konuşma başlangıcını biraz erken yakala
        redemptionFrames: 30, // Kısa susmalarda kaydı kesme
        frameSamples: 1536, // Daha düşük latency için
        minSpeechFrames: 20, // Minimum konuşma süresi
      });

      vadRef.current = vad;
      vad.start();
      
      return true;
    } catch (error) {
      console.error('VAD initialization error:', error);
      toast({
        title: "Hata!",
        description: "Mikrofon erişimi alınamadı.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Start recording when VAD detects speech
  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
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

      mediaRecorder.start(100); // Her 100ms'de bir chunk al
    } catch (error) {
      console.error('Recording start error:', error);
    }
  };

  // Stop recording when VAD detects silence
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Process the recorded audio with Azure and Anthropic
  const processRecording = async () => {
    try {
      setIsProcessing(true);
      
      if (audioChunksRef.current.length === 0) {
        setStatusText("Dinliyorum...");
        setIsProcessing(false);
        return;
      }

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // PDF'deki orkestrasyon: Azure -> Anthropic -> ElevenLabs
      const response = await sendAudioToOrchestrator(audioBlob);
      
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
      setStatusText("Dinliyorum...");
      setIsProcessing(false);
    }
  };

  // Send audio to backend orchestrator (Azure -> Anthropic -> ElevenLabs)
  const sendAudioToOrchestrator = async (audioBlob: Blob): Promise<Blob | null> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('conversationHistory', JSON.stringify(conversationHistory));
      
      const response = await fetch('/api/voice/smart-process', {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Get conversation history from headers if available
      const historyHeader = response.headers.get('x-conversation-update');
      if (historyHeader) {
        try {
          const historyUpdate = JSON.parse(historyHeader);
          setConversationHistory(prev => [...prev, historyUpdate]);
        } catch (e) {
          console.log('Conversation history parse error:', e);
        }
      }

      return await response.blob();
    } catch (error) {
      console.error('Error sending audio to orchestrator:', error);
      return null;
    }
  };

  // Play assistant response and continue conversation
  const playAssistantResponse = async (audioBlob: Blob) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      assistantAudioRef.current = audio;

      audio.onloadstart = () => {
        setIsAssistantSpeaking(true);
        setStatusText("Asistan konuşuyor...");
        setIsProcessing(false);
      };

      audio.onended = () => {
        console.log("Asistan konuşmayı bitirdi. VAD tekrar aktif.");
        setIsAssistantSpeaking(false);
        setStatusText("Dinliyorum...");
        URL.revokeObjectURL(audioUrl);
        // VAD zaten çalışıyor, kullanıcı konuşmaya başlayınca otomatik algılayacak
      };

      audio.onerror = () => {
        setIsAssistantSpeaking(false);
        setStatusText("Dinliyorum...");
        setIsProcessing(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing assistant response:', error);
      setIsAssistantSpeaking(false);
      setStatusText("Dinliyorum...");
      setIsProcessing(false);
    }
  };

  // Start conversation with VAD
  const startConversation = async () => {
    const vadInitialized = await initializeVAD();
    if (vadInitialized) {
      setIsActive(true);
      setStatusText("Dinliyorum... Konuşmaya başlayın");
      
      toast({
        title: "Görüşme Başladı!",
        description: "Artık konuşabilirsiniz. Sustuğunuzda otomatik olarak algılanacak.",
      });
    }
  };

  // Stop conversation and clean up
  const stopConversation = () => {
    if (vadRef.current) {
      vadRef.current.destroy();
      vadRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (assistantAudioRef.current) {
      assistantAudioRef.current.pause();
      assistantAudioRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    
    setIsActive(false);
    setIsListening(false);
    setIsAssistantSpeaking(false);
    setIsProcessing(false);
    setStatusText("Görüşmeyi Başlat");
    setConversationHistory([]);
  };

  // Handle main button click
  const handleMainButton = () => {
    if (isActive) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  // Stop assistant if speaking
  const stopAssistant = () => {
    if (assistantAudioRef.current) {
      assistantAudioRef.current.pause();
      assistantAudioRef.current.currentTime = 0;
    }
    setIsAssistantSpeaking(false);
    setStatusText("Dinliyorum...");
  };

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[90vh] p-8", className)}>
      <Card className="w-full max-w-lg text-center shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">🧠 Akıllı Asistan</CardTitle>
            {onClose && (
              <Button variant="ghost" onClick={onClose} size="sm">
                ✕
              </Button>
            )}
          </div>
          <CardDescription className="text-lg">
            Real-time akıcı konuşma deneyimi
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Smart Avatar with real-time animations */}
          <div className="flex justify-center">
            <div 
              className={cn(
                "w-40 h-40 rounded-full bg-gradient-to-br transition-all duration-300 ease-in-out relative overflow-hidden",
                isAssistantSpeaking && "from-green-500 to-emerald-600 shadow-2xl shadow-green-500/60 scale-110",
                isListening && "from-blue-500 to-cyan-600 shadow-xl shadow-blue-500/60 scale-105 animate-pulse",
                isProcessing && "from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/50",
                !isActive && "from-gray-400 to-gray-600 shadow-md",
                isActive && !isListening && !isAssistantSpeaking && !isProcessing && "from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/40"
              )}
              data-testid="avatar-smart-assistant"
            >
              {/* Audio visualization effect */}
              {(isListening || isAssistantSpeaking) && (
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              )}
              
              <div className="w-full h-full rounded-full flex items-center justify-center text-white text-5xl relative z-10">
                {isProcessing ? (
                  <Loader2 className="h-16 w-16 animate-spin" />
                ) : isAssistantSpeaking ? (
                  <Volume2 className="h-16 w-16 animate-bounce" />
                ) : isListening ? (
                  <Mic className="h-16 w-16 text-blue-100 animate-pulse" />
                ) : isActive ? (
                  <Mic className="h-16 w-16" />
                ) : (
                  <MicOff className="h-16 w-16" />
                )}
              </div>
            </div>
          </div>

          {/* Status and conversation info */}
          <div className="space-y-4">
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              {statusText}
            </p>
            
            {conversationHistory.length > 0 && (
              <p className="text-sm text-gray-500">
                {conversationHistory.length} konuşma turu tamamlandı
              </p>
            )}
          </div>

          {/* Control Buttons */}
          <div className="space-y-4">
            <Button
              size="lg"
              className={cn(
                "w-full h-16 text-xl font-bold rounded-2xl transition-all duration-300",
                isActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
              )}
              onClick={handleMainButton}
              data-testid="button-conversation-control"
            >
              {isActive ? (
                <>
                  <PhoneOff className="h-6 w-6 mr-3" />
                  Görüşmeyi Bitir
                </>
              ) : (
                <>
                  <Phone className="h-6 w-6 mr-3" />
                  Görüşmeyi Başlat
                </>
              )}
            </Button>

            {/* Assistant control when speaking */}
            {isAssistantSpeaking && (
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-lg"
                onClick={stopAssistant}
                data-testid="button-stop-assistant"
              >
                <VolumeX className="h-5 w-5 mr-2" />
                Asistanı Durdur
              </Button>
            )}
          </div>

          {/* Real-time status indicators */}
          <div className="flex justify-center space-x-4 text-sm">
            <div className={cn(
              "flex items-center space-x-2",
              isActive ? "text-green-600" : "text-gray-400"
            )}>
              <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500" : "bg-gray-400")} />
              <span>VAD Aktif</span>
            </div>
            <div className={cn(
              "flex items-center space-x-2",
              isListening ? "text-blue-600" : "text-gray-400"
            )}>
              <div className={cn("w-2 h-2 rounded-full", isListening ? "bg-blue-500 animate-pulse" : "bg-gray-400")} />
              <span>Dinliyor</span>
            </div>
            <div className={cn(
              "flex items-center space-x-2",
              isAssistantSpeaking ? "text-purple-600" : "text-gray-400"
            )}>
              <div className={cn("w-2 h-2 rounded-full", isAssistantSpeaking ? "bg-purple-500 animate-pulse" : "bg-gray-400")} />
              <span>Konuşuyor</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}