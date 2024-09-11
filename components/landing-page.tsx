"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import Header from "./header";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen text-white bg-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 ">
            Track Your Fitness Journey with Goobers
          </h1>
          <p className="text-xl mb-8">
            Record, analyze, and optimize your workouts with our AI-powered
            platform.
          </p>
          <Link href="/sign-up">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-lg py-2 px-6"
              variant="default"
            >
              Get Started
            </Button>
          </Link>
        </section>
        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-purple-700 to-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">AI Workout Builder</h2>
            <p className="mb-4">
              Let our AI create a personalized workout plan tailored to your
              goals and fitness level.
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              variant="default"
            >
              Build My Workout
            </Button>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-purple-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Explore Workouts</h2>
            <p className="mb-4">
              Discover and try workouts shared by our community of fitness
              enthusiasts.
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              variant="default"
            >
              Browse Workouts
            </Button>
          </div>
        </section>
        <section className="bg-gradient-to-r from-purple-700 via-slate-800 to-slate-800 rounded-lg p-6 mb-12 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Create Your Workout</h2>
          <form className="space-y-4">
            <div>
              <label className="block mb-2" htmlFor="workout-title">
                Workout Title
              </label>
              <Input
                className="bg-white text-slate-900 border-slate-300"
                id="workout-title"
                placeholder="Enter workout title"
              />
            </div>
            <div>
              <label className="block mb-2" htmlFor="workout-description">
                Workout Description
              </label>
              <Textarea
                className="bg-white text-slate-900 border-slate-300"
                id="workout-description"
                placeholder="Describe your workout"
              />
            </div>
            <div>
              <label className="block mb-2" htmlFor="workout-type">
                Workout Type
              </label>
              <Select
                className="bg-white text-slate-900 border-slate-300"
                id="workout-type"
              >
                <option>Run</option>
                <option>Cycle</option>
                <option>Swim</option>
                <option>Strength Training</option>
              </Select>
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
        </section>
      </main>
      <footer className="bg-slate-800 py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Goobers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
