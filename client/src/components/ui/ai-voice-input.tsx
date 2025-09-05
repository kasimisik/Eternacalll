"use client";

import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserHook } from '@/lib/auth-hook';

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onTranscription?: (text: string) => void;
  onAIResponse?: (text: string) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  onTranscription,
  onAIResponse,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className
}: AIVoiceInputProps) {
  // Estados para controle de gravação
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);
  const [error, setError] = useState<string | null>(null);
  const [lastTranscription, setLastTranscription] = useState<string>("");
  const [lastResponse, setLastResponse] = useState<string>("");
  
  // Referencias para media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const visualizerDataRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // User info hook
  const { user } = useUserHook();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Timer effect - removed onStart/onStop from deps to avoid infinite loops
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRecording) {
      onStart?.();
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      onStop?.(time);
      if (!isProcessing) {
        setTime(0);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording, isProcessing, time]);

  // Demo mode effect
  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setIsRecording(true);
      timeoutId = setTimeout(() => {
        setIsRecording(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  // Cleanup function to avoid recreating on every render
  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Mikrofon izni ve kayıt başlatma
  const startRecording = async () => {
    try {
      setError(null);
      setLastTranscription("");
      setLastResponse("");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // MediaRecorder oluştur
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        processRecording();
      };

      // Audio visualizer setup
      setupAudioVisualizer(stream);

      mediaRecorder.start(100); // 100ms chunks
      setIsRecording(true);

      console.log('🎤 Recording started');
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini verin.');
    }
  };

  // Kayıt durdurma - useCallback for optimization
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Ses dosyasını backend'e gönder ve AI yanıtı al
  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      setIsProcessing(false);
      setError('Ses kaydı bulunamadı');
      return;
    }

    try {
      console.log('🔄 Processing audio with', audioChunksRef.current.length, 'chunks');
      
      // Audio blob oluştur
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // FormData ile backend'e gönder
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sessionId', user?.id || 'anonymous');

      console.log('📤 Sending audio to backend...');

      const response = await fetch('/api/voice/conversation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Ses işleme başarısız');
      }

      console.log('✅ Voice conversation successful:', result);

      // Transcription ve AI response'u göster
      if (result.userText) {
        setLastTranscription(result.userText);
        onTranscription?.(result.userText);
      }

      if (result.aiResponse) {
        setLastResponse(result.aiResponse);
        onAIResponse?.(result.aiResponse);
      }

      // Audio yanıtı oynat
      if (result.audioData) {
        await playAudioResponse(result.audioData);
      }

    } catch (err) {
      console.error('Voice processing error:', err);
      setError(`Ses işleme hatası: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsProcessing(false);
      setTime(0);
    }
  };

  // Audio response'u oynatma
  const playAudioResponse = async (base64Audio: string) => {
    try {
      setIsPlaying(true);
      
      // Base64'ü blob'a dönüştür
      const audioData = atob(base64Audio);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setError('Ses oynatma hatası');
      };
      
      await audio.play();
      console.log('🔊 Playing AI response audio');
      
    } catch (err) {
      setIsPlaying(false);
      console.error('Audio playback error:', err);
      setError('Ses oynatma hatası');
    }
  };

  // Audio visualizer kurulum
  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzerRef.current = analyzer;
      
      analyzer.fftSize = 256;
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      visualizerDataRef.current = dataArray;
      
      source.connect(analyzer);
      
      const updateVisualizer = () => {
        if (isRecording && analyzer && dataArray) {
          analyzer.getByteFrequencyData(dataArray);
          animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        }
      };
      
      updateVisualizer();
    } catch (err) {
      console.warn('Audio visualizer setup failed:', err);
    }
  };

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      return;
    }

    if (isProcessing || isPlaying) {
      return; // Don't allow interaction during processing
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getStatusText = () => {
    if (isProcessing) return "İşleniyor...";
    if (isPlaying) return "Yanıt oynuyor...";
    if (isRecording) return "Dinleniyor...";
    if (error) return error;
    return "Konuşmak için tıklayın";
  };

  const getStatusColor = () => {
    if (error) return "text-red-500";
    if (isProcessing) return "text-yellow-500";
    if (isPlaying) return "text-green-500";
    if (isRecording) return "text-blue-500";
    return "text-black/70 dark:text-white/70";
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        {/* Main Button */}
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-200",
            isRecording
              ? "bg-red-500/20 border-2 border-red-500 shadow-lg shadow-red-500/25"
              : isProcessing
              ? "bg-yellow-500/20 border-2 border-yellow-500"
              : isPlaying
              ? "bg-green-500/20 border-2 border-green-500"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10 border-2 border-transparent",
            (isProcessing || isPlaying) && "cursor-not-allowed opacity-75"
          )}
          type="button"
          onClick={handleClick}
          disabled={isProcessing || isPlaying}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
          ) : isPlaying ? (
            <Volume2 className="w-6 h-6 text-green-600" />
          ) : isRecording ? (
            <MicOff className="w-6 h-6 text-red-600" />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        {/* Timer */}
        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            (isRecording || isProcessing)
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        {/* Visualizer */}
        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                isRecording
                  ? "bg-red-500/60 animate-pulse"
                  : isProcessing
                  ? "bg-yellow-500/60 animate-pulse"
                  : isPlaying
                  ? "bg-green-500/60 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                (isRecording || isProcessing || isPlaying) && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Status Text */}
        <p className={cn("h-4 text-xs transition-colors", getStatusColor())}>
          {getStatusText()}
        </p>

        {/* Transcription Display */}
        {lastTranscription && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Siz:</strong> {lastTranscription}
            </p>
          </div>
        )}

        {/* AI Response Display */}
        {lastResponse && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>AI:</strong> {lastResponse}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}