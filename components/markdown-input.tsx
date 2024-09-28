"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Pencil, Check } from "lucide-react";
import { useClickAway } from "react-use";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  isEditable: boolean;
}

export function MarkdownInput({
  value,
  onChange,
  placeholder,
  label,
  isEditable,
}: MarkdownInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, () => {
    if (isEditing) {
      setIsEditing(false);
    }
  });

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div ref={ref} className="relative w-full min-w-[300px] max-w-2xl">
      {(isEditing || isEditable) && (
        <div className="flex items-center mb-2">
          <Label className="text-lg font-bold">{label}</Label>
          {isEditable && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={toggleEdit}
              aria-label={isEditing ? "Save changes" : "Edit"}
              className="mr-2"
            >
              {isEditing ? (
                <>
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
      {isEditing ? (
        <div className="border rounded-md shadow-sm">
          <ScrollArea className="h-48">
            <Textarea
              value={value}
              onChange={handleChange}
              className="w-full resize-none p-3 h-full min-h-[192px]"
              placeholder={placeholder}
              autoFocus
            />
          </ScrollArea>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>
            {value || placeholder || "_Click 'Edit' to add._"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
