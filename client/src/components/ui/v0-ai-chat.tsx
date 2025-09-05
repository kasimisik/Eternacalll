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

// n8n webhook URL'ini buraya yapıştır
const N8N_WEBHOOK_URL = 'https://n8n-sunucun.com/webhook/senin-ozel-urlin';

export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState('step_0_start'); // Konuşma adımı takibi
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

    // Sayfa yüklendiğinde ilk konuşmayı başlat
    useEffect(() => {
        const initializeConversation = async () => {
            if (messages.length === 0) {
                const aiResponse = await callN8nWebhook('start_conversation');
                if (aiResponse && aiResponse.reply) {
                    const welcomeMessage: Message = {
                        user: "",
                        ai: aiResponse.reply,
                        timestamp: new Date()
                    };
                    setMessages([welcomeMessage]);
                    
                    if (aiResponse.next_step) {
                        setCurrentStep(aiResponse.next_step);
                    }
                }
            }
        };

        initializeConversation();
    }, []); // Sadece component mount olduğunda çalışır

    // n8n webhook'unu çağıran fonksiyon
    const callN8nWebhook = async (message: string) => {
        try {
            // Kullanıcı ID'si - user varsa gerçek ID, yoksa geçici ID
            const userId = user?.id || sessionStorage.getItem('temp-user-id') || 
                          `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            if (!user?.id && !sessionStorage.getItem('temp-user-id')) {
                sessionStorage.setItem('temp-user-id', userId);
            }

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    current_step: currentStep,
                    user_id: userId
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('n8n Webhook hatası:', error);
            return null;
        }
    };

    const sendMessage = async (userMessage: string) => {
        if (!userMessage.trim()) return;

        setIsLoading(true);
        const userMsg = userMessage.trim();

        try {
            // Kullanıcı mesajını hemen göster
            const tempMessage: Message = {
                user: userMsg,
                ai: "",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, tempMessage]);

            // n8n webhook'unu çağır
            const aiResponse = await callN8nWebhook(userMsg);

            if (aiResponse && aiResponse.reply) {
                // AI yanıtını güncelle
                const newMessage: Message = {
                    user: userMsg,
                    ai: aiResponse.reply,
                    timestamp: new Date()
                };
                setMessages(prev => prev.slice(0, -1).concat(newMessage));
                
                // Bir sonraki adım için hafızayı güncelle
                if (aiResponse.next_step) {
                    setCurrentStep(aiResponse.next_step);
                }
            } else {
                // Hata durumunda mesajı güncelle
                const errorMessage: Message = {
                    user: userMsg,
                    ai: "Üzgünüm, bir bağlantı hatası oluştu. Lütfen tekrar deneyin.",
                    timestamp: new Date()
                };
                setMessages(prev => prev.slice(0, -1).concat(errorMessage));
            }
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            const errorMessage: Message = {
                user: userMsg,
                ai: "Bağlantı hatası. Lütfen tekrar deneyin.",
                timestamp: new Date()
            };
            setMessages(prev => prev.slice(0, -1).concat(errorMessage));
        } finally {
            setIsLoading(false);
        }
    };

    // İlk durumda tam ortada, konuşma başlayınca normale geçiş
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6 lg:p-8">
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
        <div className="flex flex-col h-full w-full">
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white text-center leading-tight">
                    What can I help you ship?
                </h1>
            </div>

            {/* Messages Container - Scrollable middle section */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="w-full">
                    <div className="space-y-3">
                        {messages.map((message, index) => (
                            <div key={index} className="space-y-2">
                                {/* User Message - sadece mesaj varsa göster */}
                                {message.user && (
                                    <div className="flex justify-end">
                                        <div className="bg-blue-600 text-white px-3 py-2 rounded-2xl max-w-[70%] break-words">
                                            <p className="text-sm leading-snug">{message.user}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* AI Response - sadece mesaj varsa göster */}
                                {message.ai && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 py-2 rounded-2xl max-w-[75%] break-words">
                                            <p className="text-sm leading-snug" style={{whiteSpace: 'pre-wrap'}}>{message.ai}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Loading Message */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 py-2 rounded-2xl">
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
                <div className="w-full p-4">
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

