"use client";

import { useState } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";


export function VercelV0Chat() {
    const [value, setValue] = useState("");

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-12 min-h-screen justify-center">
            <h1 className="text-4xl font-bold text-black dark:text-white text-center">
                What can I help you ship?
            </h1>

            <div className="w-full">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (value.trim()) {
                        setValue("");
                    }
                }}>
                    <PromptBox
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Ask v0 a question..."
                        className="bg-neutral-900 border-neutral-800"
                    />
                </form>
            </div>
        </div>
    );
}

