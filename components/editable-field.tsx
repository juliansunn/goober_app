import React, { useState, useRef, useEffect } from "react";
import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  type: "text" | "select";
  options?: { value: string; label: string }[];
  isEditable: boolean;
  renderDisplay: (value: string) => React.ReactNode;
}

export function EditableField({
  value,
  onChange,
  type,
  options,
  isEditable,
  renderDisplay,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleEdit = () => {
    if (isEditable) {
      if (isEditing) {
        onChange(localValue);
      } else {
        setLocalValue(value);
      }
      setIsEditing(!isEditing);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className="relative group flex items-center">
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
      <div className="flex-grow">
        {!isEditing ? (
          renderDisplay(value)
        ) : type === "text" ? (
          <Input
            ref={inputRef}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="w-full"
          />
        ) : (
          <Select value={localValue} onValueChange={setLocalValue}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
