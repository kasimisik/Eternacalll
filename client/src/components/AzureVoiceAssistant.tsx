import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Volume2 } from 'lucide-react';

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
  onAudioResponse: (audioUrl: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export function AzureVoiceAssistant({ onTranscript, onAudioResponse, isListening, setIsListening }: AudioRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{user: string, ai: string}>>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioWithAzure(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
      console.log('🎤 Kayıt başladı...');
      
    } catch (error) {
      console.error('Mikrofon erişim hatası:', error);
      alert('Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini verin.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
    console.log('🛑 Kayıt durdu...');
  };

  const processAudioWithAzure = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // FormData ile ses dosyasını gönder
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      console.log('📤 Azure STT\'ye gönderiliyor...');
      
      // Azure Speech to Text
      const sttResponse = await fetch('/api/azure/speech-to-text', {
        method: 'POST',
        body: formData
      });

      if (!sttResponse.ok) {
        throw new Error('Azure STT failed');
      }

      const sttResult = await sttResponse.json();
      const userText = sttResult.text;
      
      console.log('✅ STT Sonucu:', userText);
      setCurrentTranscript(userText);
      onTranscript(userText);

      if (!userText || userText.trim() === '') {
        setIsProcessing(false);
        return;
      }

      // Anthropic AI'ye gönder
      console.log('🤖 Anthropic AI\'ye gönderiliyor...');
      
      const aiResponse = await fetch('/api/azure/process-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage: userText,
          conversationHistory: conversationHistory
        })
      });

      if (!aiResponse.ok) {
        throw new Error('Anthropic AI failed');
      }

      const aiResult = await aiResponse.json();
      const aiText = aiResult.response;
      
      console.log('✅ AI Yanıtı:', aiText);
      setAiResponse(aiText);

      // Azure TTS ile sese çevir
      console.log('🔊 Azure TTS\'ye gönderiliyor...');
      
      const ttsResponse = await fetch('/api/azure/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: aiText
        })
      });

      if (!ttsResponse.ok) {
        throw new Error('Azure TTS failed');
      }

      // Ses dosyasını çal
      const audioArrayBuffer = await ttsResponse.arrayBuffer();
      const audioResponseBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioResponseBlob);
      
      console.log('✅ Ses çalınıyor...');
      onAudioResponse(audioUrl);
      
      // Ses dosyasını çal
      const audio = new Audio(audioUrl);
      audio.play();

      // Konuşma geçmişini güncelle
      setConversationHistory(prev => [...prev, { user: userText, ai: aiText }]);

    } catch (error) {
      console.error('❌ İşleme hatası:', error);
      alert('Ses işleme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Temizlik
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Ana Mikrofon Butonu */}
      <div className="flex justify-center">
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      {/* Durum Göstergesi */}
      <div className="text-center">
        {isProcessing && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span>İşleniyor...</span>
          </div>
        )}
        
        {isListening && !isProcessing && (
          <div className="text-red-600 font-medium animate-pulse">
            🎤 Dinliyorum... Konuşmayı bitirdiğinizde butona tekrar basın
          </div>
        )}
        
        {!isListening && !isProcessing && (
          <div className="text-gray-600">
            Konuşmaya başlamak için mikrofon butonuna basın
          </div>
        )}
      </div>

      {/* Son Konuşma */}
      {currentTranscript && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Siz:</p>
          <p className="text-blue-900 font-medium">{currentTranscript}</p>
        </div>
      )}

      {/* AI Yanıtı */}
      {aiResponse && (
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Volume2 className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600">AI Asistan:</p>
          </div>
          <p className="text-green-900 font-medium">{aiResponse}</p>
        </div>
      )}

      {/* Konuşma Geçmişi */}
      {conversationHistory.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <h4 className="font-medium text-gray-800">Konuşma Geçmişi:</h4>
          {conversationHistory.slice(-3).map((conversation, index) => (
            <div key={index} className="space-y-1">
              <div className="bg-gray-100 p-2 rounded text-sm">
                <strong>Siz:</strong> {conversation.user}
              </div>
              <div className="bg-gray-50 p-2 rounded text-sm">
                <strong>AI:</strong> {conversation.ai}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AzureVoiceAssistant;