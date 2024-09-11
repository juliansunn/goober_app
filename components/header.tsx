"use client";
import React from "react";
import Navigation from "@/components/navigation";
import { ModeToggle } from "@/components/theme-dropdown";
import { ClerkLoaded, ClerkLoading, UserButton, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import HeaderLogo from "./header-logo";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "./ui/button";

const Header = () => {
  const { user } = useUser();
  return (
    <header className="bg-gradient-to-b  from-purple-700 to-slate-800 px-4 py-6 lg:px-10">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center lg:gap-x-8">
            <HeaderLogo />
            <Navigation />
          </div>
          {user ? (
            <div className="flex items-center gap-x-4">
              <ClerkLoaded>
                <UserButton showName afterSignOutUrl="/landing" />
                <ModeToggle />
              </ClerkLoaded>
              <ClerkLoading>
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </ClerkLoading>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                variant="default"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
