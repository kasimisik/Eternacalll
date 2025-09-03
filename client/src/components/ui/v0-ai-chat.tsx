"use client";

import { useState } from "react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
} from "lucide-react";


export function VercelV0Chat() {
    const [value, setValue] = useState("");

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-4xl font-bold text-black dark:text-white">
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

                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                    <ActionButton
                        icon={<ImageIcon className="w-4 h-4" />}
                        label="Clone a Screenshot"
                    />
                    <ActionButton
                        icon={<Figma className="w-4 h-4" />}
                        label="Import from Figma"
                    />
                    <ActionButton
                        icon={<FileUp className="w-4 h-4" />}
                        label="Upload a Project"
                    />
                    <ActionButton
                        icon={<MonitorIcon className="w-4 h-4" />}
                        label="Landing Page"
                    />
                    <ActionButton
                        icon={<CircleUserRound className="w-4 h-4" />}
                        label="Sign Up Form"
                    />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors text-xs sm:text-sm"
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}