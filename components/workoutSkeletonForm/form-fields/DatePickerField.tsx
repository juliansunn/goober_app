import React from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "./FormField";

interface DatePickerFieldProps {
  id: string;
  label: string;
  date: Date;
  error?: string;
  onDateChange: (name: string, date: Date | null) => void;
  fieldName: string;
}

export function DatePickerField({
  id,
  label,
  date,
  error,
  onDateChange,
  fieldName,
}: DatePickerFieldProps) {
  const handleDateChange = (newDate: Date | undefined) => {
    onDateChange(fieldName, newDate ?? null);
  };

  return (
    <FormField id={id} label={label} error={error}>
      <DatePicker
        date={date}
        onDateChange={handleDateChange}
        placeholder={`Select ${label.toLowerCase()}`}
      />
    </FormField>
  );
}
