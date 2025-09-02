import { useState } from 'react';
import { X, Mic } from 'lucide-react';
import AzureVoiceAssistant from './AzureVoiceAssistant';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceAssistantModal({ isOpen, onClose }: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [audioResponses, setAudioResponses] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleTranscript = (text: string) => {
    setTranscripts(prev => [...prev, text]);
  };

  const handleAudioResponse = (audioUrl: string) => {
    setAudioResponses(prev => [...prev, audioUrl]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mic className="w-6 h-6" />
              <h2 className="text-xl font-bold">Azure Sesli Asistan</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-2">
            Azure Speech + Anthropic AI ile konuşun
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <AzureVoiceAssistant
            onTranscript={handleTranscript}
            onAudioResponse={handleAudioResponse}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
          ✨ Mikrofona tıklayın, konuşun ve AI yanıtını dinleyin
        </div>
      </div>
    </div>
  );
}

interface VoiceAssistantTriggerProps {
  onOpen: () => void;
}

export function VoiceAssistantTrigger({ onOpen }: VoiceAssistantTriggerProps) {
  return (
    <button
      onClick={onOpen}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
    >
      <div className="flex items-center space-x-3">
        <Mic className="w-6 h-6" />
        <span>Sesli Asistan ile Konuş</span>
      </div>
    </button>
  );
}