import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SmartVoiceAssistant } from './SmartVoiceAssistant';
import { Mic, Brain, Zap } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceAssistantModal({ isOpen, onClose }: VoiceAssistantModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Modal Header */}
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                <Brain className="h-6 w-6" />
              </div>
              Akıllı Sesli Asistan
              <div className="flex items-center gap-1 text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Real-time
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Modal Content */}
          <div className="flex-1 overflow-hidden">
            <SmartVoiceAssistant 
              className="h-full" 
              onClose={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface VoiceAssistantTriggerProps {
  onOpen: () => void;
}

export function VoiceAssistantTrigger({ onOpen }: VoiceAssistantTriggerProps) {
  return (
    <Button
      onClick={onOpen}
      size="lg"
      className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
      data-testid="button-open-voice-assistant"
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Mic className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-lg font-bold">Sesli Asistan</span>
          <span className="text-xs opacity-90 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Real-time akıcı konuşma
          </span>
        </div>
      </div>
    </Button>
  );
}