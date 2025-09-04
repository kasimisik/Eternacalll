"use client";

import { useState, useEffect, useRef } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { TextDotsLoader } from "@/components/ui/loader";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ModalPricing } from "@/components/ui/modal-pricing";
import { useUserHook } from '@/lib/auth-hook';

interface Message {
  user: string;
  ai: string;
  timestamp: Date;
}

export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(true); // Default to true to avoid flash
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useUserHook();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Check subscription status
    useEffect(() => {
        const checkSubscription = async () => {
            if (!user?.id) return;
            
            try {
                const response = await fetch(`/api/user/subscription/${user.id}`);
                const data = await response.json();
                setHasSubscription(data.hasSubscription);
            } catch (error) {
                console.error('Subscription check failed:', error);
                setHasSubscription(false);
            }
        };

        checkSubscription();
    }, [user?.id]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    const sendMessage = async (userMessage: string) => {
        if (!userMessage.trim()) return;

        setIsLoading(true);
        const userMsg = userMessage.trim();

        try {
            // Unique session ID oluştur (bir kez oluştur ve session boyunca kullan)
            const sessionId = sessionStorage.getItem('chat-session-id') || 
                             `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('chat-session-id', sessionId);

            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userMessage: userMsg,
                    sessionId: sessionId
                })
            });

            const data = await response.json();

            if (data.success && data.response) {
                const newMessage: Message = {
                    user: userMsg,
                    ai: data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, newMessage]);
            } else {
                console.error('API Error:', data);
                const errorMessage: Message = {
                    user: userMsg,
                    ai: "Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin.",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            const errorMessage: Message = {
                user: userMsg,
                ai: "Bağlantı hatası. Lütfen tekrar deneyin.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // İlk durumda tam ortada, konuşma başlayınca normale geçiş
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full max-w-4xl mx-auto p-4">
                {/* Centered Header and Input */}
                <div className="text-center space-y-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
                        What can I help you ship?
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4">
                        Başlamak için bir mesaj gönderin.
                    </p>
                </div>

                {/* Centered Input with Premium Button */}
                <div className="w-full max-w-3xl mt-8">
                    <div className="relative">
                        {/* Premium Button - Show only if no subscription */}
                        {!hasSubscription && (
                            <div className="absolute -top-16 right-0 z-10">
                                <RainbowButton 
                                    onClick={() => setShowPricingModal(true)}
                                    className="text-sm px-4 py-2 h-9"
                                >
                                    🚀 Premium Özellikleri Aç
                                </RainbowButton>
                            </div>
                        )}
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (value.trim() && !isLoading) {
                                sendMessage(value);
                                setValue("");
                            }
                        }}>
                            <PromptBox
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Asistanınıza mesaj gönderin..."
                                className="bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800"
                                disabled={isLoading}
                            />
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Konuşma başladıktan sonra normal chat arayüzü
    return (
        <div className="flex flex-col h-screen w-full max-w-4xl mx-auto">
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white text-center">
                    What can I help you ship?
                </h1>
            </div>

            {/* Messages Container - Scrollable middle section */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="w-full max-w-3xl mx-auto">
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className="space-y-3">
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[85%] sm:max-w-[80%] break-words">
                                        <p className="text-sm sm:text-base">{message.user}</p>
                                    </div>
                                </div>
                                
                                {/* AI Response */}
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-3 rounded-lg max-w-[85%] sm:max-w-[80%] break-words">
                                        <p className="text-sm sm:text-base" style={{whiteSpace: 'pre-wrap'}}>{message.ai}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Loading Message */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-3 rounded-lg">
                                    <TextDotsLoader 
                                        text="Yanıtlıyor" 
                                        size="sm"
                                        className="text-gray-600 dark:text-gray-300"
                                    />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Input Form - Fixed at bottom */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="w-full max-w-3xl mx-auto p-4">
                    <div className="relative">
                        {/* Premium Button - Show only if no subscription */}
                        {!hasSubscription && (
                            <div className="absolute -top-16 right-0 z-10">
                                <RainbowButton 
                                    onClick={() => setShowPricingModal(true)}
                                    className="text-sm px-4 py-2 h-9"
                                >
                                    🚀 Premium Özellikleri Aç
                                </RainbowButton>
                            </div>
                        )}
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (value.trim() && !isLoading) {
                                sendMessage(value);
                                setValue("");
                            }
                        }}>
                            <PromptBox
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Asistanınıza mesaj gönderin..."
                                className="bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800"
                                disabled={isLoading}
                            />
                        </form>
                    </div>
                </div>
            </div>

            {/* Pricing Modal */}
            <ModalPricing
                isOpen={showPricingModal}
                onClose={() => setShowPricingModal(false)}
            />
        </div>
    );
}

