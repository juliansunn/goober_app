import React from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiLoadingProps {
  loadingText?: string;
  className?: string;
}

export function AiLoading({
  loadingText = "Generating...",
  className,
}: AiLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center mt-8 space-y-4",
        className
      )}
    >
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
        <Bot className="animate-reverse-spin animate-pulse absolute inset-0 w-1/2 h-1/2 m-auto text-primary" />
      </div>
      <p className="text-lg font-medium text-muted-foreground animate-pulse">
        {loadingText}
      </p>
    </div>
  );
}
