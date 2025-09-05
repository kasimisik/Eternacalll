"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Sparkles, Zap } from "lucide-react";

interface PlanOption {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
}

const plansSample: PlanOption[] = [
    {
        id: "basic",
        name: "Temel Plan",
        price: "₺29",
        description: "Küçük projeler için mükemmel",
        features: ["5 proje", "Temel analitik", "24 saat destek"],
    },
    {
        id: "pro",
        name: "Profesyonel Plan",
        price: "₺99",
        description: "Profesyonel geliştiriciler için",
        features: [
            "Sınırsız proje",
            "Gelişmiş analitik",
            "Öncelikli destek",
            "Premium özellikler",
        ],
    },
];

function ModalPricing({
    plans = plansSample,
    isOpen,
    onClose,
}: {
    plans?: PlanOption[];
    isOpen?: boolean;
    onClose?: () => void;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("pro");

    const modalOpen = isOpen !== undefined ? isOpen : internalOpen;
    const handleClose = onClose || (() => setInternalOpen(false));

    return (
        <>

            <Dialog open={modalOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
                            <Zap className="h-5 w-5 text-zinc-900 dark:text-white" />
                            Premium Planını Seç
                        </DialogTitle>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                            İhtiyaçlarınıza uygun mükemmel planı seçin. İstediğiniz zaman yükseltme veya düşürme yapabilirsiniz.
                        </p>
                    </DialogHeader>

                    <RadioGroup
                        defaultValue={selectedPlan}
                        onValueChange={setSelectedPlan}
                        className="gap-4 py-4"
                    >
                        {plans.map((plan) => (
                            <label
                                key={plan.id}
                                className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all
                                    ${
                                        selectedPlan === plan.id
                                            ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800/50"
                                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    }`}
                            >
                                <RadioGroupItem
                                    value={plan.id}
                                    className="sr-only"
                                />
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                            {plan.name}
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {plan.description}
                                        </p>
                                    </div>
                                    <div className="flex items-baseline">
                                        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {plan.price}
                                        </span>
                                        <span className="ml-1 text-zinc-500 dark:text-zinc-400">
                                            /ay
                                        </span>
                                    </div>
                                </div>
                                <ul className="space-y-2 mt-4">
                                    {plan.features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center text-sm text-zinc-600 dark:text-zinc-300"
                                        >
                                            <Check className="w-4 h-4 mr-2 text-zinc-900 dark:text-white" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                {selectedPlan === plan.id && (
                                    <div className="absolute -top-2 -right-2">
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-white">
                                            <Check className="h-3 w-3 text-white dark:text-zinc-900" />
                                        </span>
                                    </div>
                                )}
                            </label>
                        ))}
                    </RadioGroup>

                    <DialogFooter className="flex flex-col gap-2">
                        <Button
                            onClick={handleClose}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                        >
                            Seçimi Onayla
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="w-full text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                            İptal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}


export { ModalPricing, PlanOption }