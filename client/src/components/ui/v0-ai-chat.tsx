"use client";

import { useState, useEffect, useRef } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { TextDotsLoader } from "@/components/ui/loader";
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useUserHook();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


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
            <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Centered Header and Input */}
                <div className="text-center space-y-6 sm:space-y-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black dark:text-white leading-tight">
                        What can I help you ship?
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 px-2 sm:px-4 max-w-2xl mx-auto">
                        Başlamak için bir mesaj gönderin.
                    </p>
                </div>

                {/* Centered Input */}
                <div className="w-full max-w-4xl mt-6 sm:mt-8 lg:mt-12 px-2 sm:px-0">
                    <div className="relative">
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
                                className="bg-gray-800 dark:bg-gray-800 border-gray-600 dark:border-gray-600 text-white text-sm sm:text-base"
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
        <div className="flex flex-col h-screen w-full max-w-7xl mx-auto">
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white text-center leading-tight">
                    What can I help you ship?
                </h1>
            </div>

            {/* Messages Container - Scrollable middle section */}
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                <div className="w-full max-w-4xl mx-auto">
                    <div className="space-y-3 sm:space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className="space-y-2 sm:space-y-3">
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-blue-600 text-white p-2 sm:p-3 rounded-lg max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] break-words">
                                        <p className="text-xs sm:text-sm lg:text-base leading-relaxed">{message.user}</p>
                                    </div>
                                </div>
                                
                                {/* AI Response */}
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-2 sm:p-3 rounded-lg max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] break-words">
                                        <p className="text-xs sm:text-sm lg:text-base leading-relaxed" style={{whiteSpace: 'pre-wrap'}}>{message.ai}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Loading Message */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-2 sm:p-3 rounded-lg">
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
            <div className="flex-shrink-0 bg-transparent">
                <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">
                    <div className="relative">
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
                                className="bg-gray-800 dark:bg-gray-800 border-gray-600 dark:border-gray-600 text-white text-sm sm:text-base"
                                disabled={isLoading}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

