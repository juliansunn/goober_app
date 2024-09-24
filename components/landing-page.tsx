"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import AnimatedButton from "./animated-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen text-white bg-slate-800">
      {/* <Header /> */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <section className="text-center mb-12 max-w-4xl w-full">
          <h1 className="text-6xl font-bold mb-4 ">
            Track Your Fitness Journey with Goobers
          </h1>
          <p className="text-xl mb-8">
            Record, analyze, and optimize your workouts with our AI-powered
            platform.
          </p>
          <div className="flex justify-center">
            <AnimatedButton />
          </div>
        </section>
        <section className="w-full max-w-5xl mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <LandingCard title="AI Workout Builder">
              <div className="h-full flex flex-col justify-center">
                <p className="mb-4">
                  Let our AI create a personalized workout plan tailored to your
                  goals and fitness level.
                </p>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 mt-auto"
                  variant="default"
                >
                  Build My Workout
                </Button>
              </div>
            </LandingCard>
            <LandingCard title="Explore Workouts">
              <div className="h-full flex flex-col justify-center">
                <p className="mb-4">
                  Discover and try workouts shared by our community of fitness
                  enthusiasts.
                </p>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 mt-auto"
                  variant="default"
                >
                  Browse Workouts
                </Button>
              </div>
            </LandingCard>
            <div className="md:col-span-2">
              <LandingCard title="Create Your Workout" fullWidth={true}>
                <form className="space-y-4">
                  <div>
                    <label className="block mb-2" htmlFor="workout-title">
                      Workout Title
                    </label>
                    <input
                      className="w-full bg-white text-slate-900 border-slate-300 rounded-md"
                      id="workout-title"
                      placeholder="Enter workout title"
                    />
                  </div>
                  <div>
                    <label className="block mb-2" htmlFor="workout-description">
                      Workout Description
                    </label>
                    <textarea
                      className="w-full bg-white text-slate-900 border-slate-300 rounded-md"
                      id="workout-description"
                      placeholder="Describe your workout"
                    />
                  </div>
                  <div>
                    <label className="block mb-2" htmlFor="workout-type">
                      Workout Type
                    </label>
                    <select
                      className="w-full bg-white text-slate-900 border-slate-300 rounded-md"
                      id="workout-type"
                    >
                      <option>Run</option>
                      <option>Cycle</option>
                      <option>Swim</option>
                      <option>Strength Training</option>
                    </select>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      variant="default"
                    >
                      Add Interval
                    </Button>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      variant="default"
                    >
                      Submit Workout
                    </Button>
                  </div>
                </form>
              </LandingCard>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-slate-800 py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Goobers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

interface LandingCardProps {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const LandingCard: React.FC<LandingCardProps> = ({ title, children, fullWidth = false }) => {
  return (
    <Card className={`w-full ${fullWidth ? '' : 'max-w-sm'} bg-slate-800 overflow-hidden rounded-lg border border-slate-700/30`}>
      <CardHeader className="bg-gradient-to-tl from-slate-700/20 to-slate-600/30 p-6">
        <h2 className="text-2xl font-bold text-white relative z-10">{title}</h2>
      </CardHeader>
      <CardContent className="bg-gradient-to-tr from-slate-700/30 to-slate-800 p-6 text-white">
        {children}
      </CardContent>
    </Card>
  );
};
