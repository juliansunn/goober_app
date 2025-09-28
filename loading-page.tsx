"use client";

import { Progress } from "@/components/ui/progress";
import { CalendarIcon } from "@radix-ui/react-icons";
import { CheckCircle, ClipboardList, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";
import "./shimmer.css";

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [statusText, setStatusText] = useState(
    "Initializing your workout schedule..."
  );

  const stages = [
    {
      name: "Schedule Skeleton Creation",
      icon: <CalendarIcon className="h-6 w-6" />,
      details: [
        "Creating weekly structure...",
        "Setting up workout days...",
        "Allocating rest periods...",
        "Finalizing schedule framework...",
      ],
    },
    {
      name: "Weekly Plan Generation",
      icon: <ClipboardList className="h-6 w-6" />,
      details: [
        "Analyzing fitness goals...",
        "Balancing workout intensity...",
        "Optimizing recovery periods...",
        "Structuring progressive overload...",
      ],
    },
    {
      name: "Workout Population",
      icon: <Dumbbell className="h-6 w-6" />,
      details: [
        "Selecting optimal exercises...",
        "Calculating sets and reps...",
        "Adjusting for equipment availability...",
        "Finalizing workout details...",
      ],
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        const newProgress = Math.min(progress + 1, 100);
        setProgress(newProgress);

        if (newProgress < 33) {
          setCurrentStage(0);
          const detailIndex = Math.floor(
            (newProgress / 33) * stages[0].details.length
          );
          setStatusText(
            stages[0].details[
              Math.min(detailIndex, stages[0].details.length - 1)
            ]
          );
        } else if (newProgress < 66) {
          setCurrentStage(1);
          const detailIndex = Math.floor(
            ((newProgress - 33) / 33) * stages[1].details.length
          );
          setStatusText(
            stages[1].details[
              Math.min(detailIndex, stages[1].details.length - 1)
            ]
          );
        } else if (newProgress < 100) {
          setCurrentStage(2);
          const detailIndex = Math.floor(
            ((newProgress - 66) / 34) * stages[2].details.length
          );
          setStatusText(
            stages[2].details[
              Math.min(detailIndex, stages[2].details.length - 1)
            ]
          );
        } else {
          setStatusText("Your workout schedule is ready!");
          setIsComplete(true);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 space-y-8 relative overflow-hidden">
        {/* Shimmer effect only during loading */}
        {!isComplete && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="shimmer-effect"></div>
          </div>
        )}

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-center mb-2 text-purple-800">
            Building Your Workout Schedule
          </h1>

          <div className="flex justify-center mb-8">
            {isComplete ? (
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-purple-100 animate-bounce">
                <CheckCircle className="h-12 w-12 text-purple-600" />
              </div>
            ) : (
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-gray-200 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  {stages[currentStage].icon}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-200" />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <p className="text-center font-medium text-purple-700">
                  {isComplete ? "Complete!" : stages[currentStage].name}
                </p>
                <p className="text-center text-sm text-gray-600 animate-pulse">
                  {statusText}
                </p>
              </div>

              <div className="flex justify-between pt-2">
                {stages.map((stage, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        index < currentStage
                          ? "bg-purple-500 text-white"
                          : index === currentStage && !isComplete
                            ? "bg-purple-200 text-purple-700 animate-pulse"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index < currentStage ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-1 text-center max-w-[80px] text-gray-600">
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isComplete && (
            <div className="mt-6 flex justify-center">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition-colors">
                View Your Schedule
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-4 text-center max-w-md">
        We're creating a personalized workout schedule based on your goals,
        preferences, and availability.
      </p>
    </div>
  );
}
