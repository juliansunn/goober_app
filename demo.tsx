"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import LoadingPage from "./loading-page"

export default function Demo() {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => {
    setIsLoading(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {isLoading ? (
        <LoadingPage />
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">Workout Schedule Builder</h1>
          <p className="text-gray-600 mb-8 text-center">
            Create your personalized workout schedule with our advanced AI-powered builder
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={startLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              Build My Workout Schedule
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

