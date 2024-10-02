"use client";
import React from "react";
import Navigation from "@/components/navigation";
import { ModeToggle } from "@/components/theme-dropdown";
import { ClerkLoaded, ClerkLoading, UserButton, useUser } from "@clerk/nextjs";
import { useSession, signIn, signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStrava } from "@fortawesome/free-brands-svg-icons";
import { Loader2, Slash } from "lucide-react";
import HeaderLogo from "./header-logo";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const Header = () => {
  const { user } = useUser();
  const { data: session, status } = useSession();

  const handleStravaAuth = () => {
    if (session) {
      signOut();
    } else {
      signIn("strava");
    }
  };

  const renderStravaButton = () => {
    if (status === "loading") {
      return <Loader2 className="size-6 animate-spin text-slate-400" />;
    }

    const tooltipText = session ? "Disconnect Strava" : "Connect Strava";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleStravaAuth}
              type="button"
              size="icon"
              className="relative rounded-full bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
            >
              {session ? (
                <FontAwesomeIcon
                  icon={faStrava}
                  className="h-4 w-4 text-orange-500"
                />
              ) : (
                <div className="relative flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faStrava}
                    className="h-4 w-4 text-slate-500 opacity-75"
                  />
                  <Slash className="absolute h-8 w-8 text-slate-500 opacity-75" />
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <header className="bg-gradient-to-b from-purple-700 to-slate-800 px-4 py-6 lg:px-10">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center lg:gap-x-8">
            <HeaderLogo />
            <Navigation />
          </div>
          <div className="flex items-center gap-x-4">
            <ClerkLoaded>
              <UserButton showName afterSignOutUrl="/landing" />
              {renderStravaButton()}
              <ModeToggle />
            </ClerkLoaded>
            <ClerkLoading>
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </ClerkLoading>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
