"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandingPromptInputProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  prompt: string;
  onChange: (prompt: string) => void;
  isLoading?: boolean;
  maxRows?: number;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ExpandingPromptInput: React.FC<ExpandingPromptInputProps> = ({
  onSubmit,
  placeholder = "Type your prompt here...",
  prompt,
  onChange,
  isLoading = false,
  maxRows = 5,
  icon = <MessageSquare className="h-5 w-5" />,
  className,
  style,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeTextarea = () => {
      if (textareaRef.current) {
        const lineHeight = parseInt(
          getComputedStyle(textareaRef.current).lineHeight
        );

        textareaRef.current.style.height = `${lineHeight}px`;

        if (prompt.length > 0) {
          const maxHeight = lineHeight * maxRows;
          const newHeight = Math.min(
            textareaRef.current.scrollHeight,
            maxHeight
          );
          textareaRef.current.style.height = `${newHeight}px`;
          textareaRef.current.style.overflowY =
            textareaRef.current.scrollHeight > maxHeight ? "auto" : "hidden";
        }
      }
    };

    resizeTextarea();
    window.addEventListener("resize", resizeTextarea);

    return () => {
      window.removeEventListener("resize", resizeTextarea);
    };
  }, [prompt, maxRows]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
      onChange("");
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full min-h-[3rem] flex", className)}
      style={style}
    >
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "pr-12 rounded-3xl w-full h-[3rem] text-md resize-none overflow-hidden",
            className
          )}
          style={{
            paddingTop: "0.625rem",
            paddingBottom: "0.625rem",
            minHeight: "3rem",
            height: "3rem",
            ...style,
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="absolute right-2 bottom-2 rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Submit Prompt"
        >
          {icon}
        </Button>
      </form>
    </div>
  );
};
