"use client";

import { useState } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";

interface Message {
  user: string;
  ai: string;
  timestamp: Date;
}

export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (userMessage: string) => {
        if (!userMessage.trim()) return;

        setIsLoading(true);
        const userMsg = userMessage.trim();

        try {
            const response = await fetch('/api/azure/process-conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userMessage: userMsg,
                    conversationHistory: messages
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

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-6 min-h-screen">
            {/* Header */}
            <h1 className="text-4xl font-bold text-black dark:text-white text-center pt-8">
                What can I help you ship?
            </h1>

            {/* Messages Container */}
            <div className="flex-1 w-full max-w-3xl">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
                            Başlamak için bir mesaj gönderin.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 pb-4">
                        {messages.map((message, index) => (
                            <div key={index} className="space-y-3">
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[80%]">
                                        <p>{message.user}</p>
                                    </div>
                                </div>
                                
                                {/* AI Response */}
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-3 rounded-lg max-w-[80%]">
                                        <p style={{whiteSpace: 'pre-wrap'}}>{message.ai}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Loading Message */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-3 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                        <p>EternaCall asistanı yanıtlıyor...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <div className="w-full max-w-3xl">
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
                        placeholder="EternaCall asistanına mesaj gönderin..."
                        className="bg-neutral-900 border-neutral-800"
                        disabled={isLoading}
                    />
                </form>
            </div>
        </div>
    );
}

