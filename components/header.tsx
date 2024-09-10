import React from "react";
import Navigation from "@/components/navigation";
import {ModeToggle} from "@/components/theme-dropdown"
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import HeaderLogo from "./header-logo";

const Header = () => {
  return (
    <header className="bg-gradient-to-b from-slate-800 to-purple-700 px-4 py-6 lg:px-10">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center lg:gap-x-8">
            <HeaderLogo />
            <Navigation />
          </div>
          <div className="flex items-center gap-x-4">
            <ClerkLoaded>
              <UserButton showName afterSignOutUrl="/" />
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
