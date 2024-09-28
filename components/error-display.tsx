import React from "react";

interface ErrorDisplayProps {
  title: string;
  message: string;
}

export function ErrorDisplay({ title, message }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
