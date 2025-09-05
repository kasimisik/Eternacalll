import React from "react";
import { GlowCard } from "@/components/ui/spotlight-card";

const templateData = [
  { id: 1, title: "Business Chat", description: "Professional business communication", glowColor: "blue" as const },
  { id: 2, title: "Customer Support", description: "24/7 customer assistance", glowColor: "green" as const },
  { id: 3, title: "Sales Agent", description: "AI-powered sales conversations", glowColor: "purple" as const },
  { id: 4, title: "Technical Support", description: "Expert technical help", glowColor: "red" as const },
  { id: 5, title: "Marketing Assistant", description: "Creative marketing solutions", glowColor: "orange" as const },
  { id: 6, title: "Personal Trainer", description: "Fitness and health guidance", glowColor: "blue" as const },
  { id: 7, title: "Language Teacher", description: "Interactive language learning", glowColor: "green" as const },
  { id: 8, title: "Financial Advisor", description: "Smart financial planning", glowColor: "purple" as const },
  { id: 9, title: "Travel Guide", description: "Personalized travel planning", glowColor: "red" as const },
  { id: 10, title: "Recipe Assistant", description: "Cooking and recipe help", glowColor: "orange" as const },
  { id: 11, title: "Study Buddy", description: "Educational support", glowColor: "blue" as const },
  { id: 12, title: "Therapist", description: "Mental health support", glowColor: "green" as const },
  { id: 13, title: "Code Review", description: "Programming assistance", glowColor: "purple" as const },
  { id: 14, title: "Writer Assistant", description: "Creative writing help", glowColor: "red" as const },
  { id: 15, title: "Music Teacher", description: "Music theory and practice", glowColor: "orange" as const },
  { id: 16, title: "Real Estate", description: "Property buying guidance", glowColor: "blue" as const },
  { id: 17, title: "Legal Advisor", description: "Legal consultation", glowColor: "green" as const },
  { id: 18, title: "Career Coach", description: "Professional development", glowColor: "purple" as const },
  { id: 19, title: "Meditation Guide", description: "Mindfulness and relaxation", glowColor: "red" as const },
  { id: 20, title: "Pet Care", description: "Animal care and training", glowColor: "orange" as const },
  { id: 21, title: "Home Designer", description: "Interior design ideas", glowColor: "blue" as const },
  { id: 22, title: "Game Master", description: "RPG and gaming assistance", glowColor: "green" as const },
  { id: 23, title: "Fashion Stylist", description: "Style and clothing advice", glowColor: "purple" as const },
  { id: 24, title: "Gardening Expert", description: "Plant and garden care", glowColor: "red" as const },
  { id: 25, title: "Photography Coach", description: "Photo techniques and tips", glowColor: "orange" as const },
  { id: 26, title: "Event Planner", description: "Special occasion planning", glowColor: "blue" as const },
  { id: 27, title: "Nutrition Expert", description: "Diet and nutrition guidance", glowColor: "green" as const },
  { id: 28, title: "Art Teacher", description: "Creative art instruction", glowColor: "purple" as const },
  { id: 29, title: "Science Tutor", description: "STEM education support", glowColor: "red" as const },
  { id: 30, title: "Life Coach", description: "Personal development", glowColor: "orange" as const },
];

export default function Templates() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground">
            {templateData.length} şablon mevcut
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templateData.map((template) => (
          <GlowCard 
            key={template.id} 
            glowColor={template.glowColor}
            customSize={true}
            className="w-full h-64 cursor-pointer hover:scale-105 transition-transform duration-300"
            data-testid={`template-card-${template.id}`}
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {template.title}
                </h3>
                <p className="text-sm text-gray-300">
                  {template.description}
                </p>
              </div>
              <div className="mt-4">
                <button 
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg py-2 px-4 text-sm font-medium text-white transition-colors"
                  data-testid={`template-button-${template.id}`}
                >
                  Kullan
                </button>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}