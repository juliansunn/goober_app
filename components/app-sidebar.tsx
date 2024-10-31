"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useSession, signIn, signOut } from "next-auth/react";

import {
  Calendar,
  ChevronDown,
  Dumbbell,
  Home,
  Loader2,
  PlusCircle,
  Search,
  Settings,
  Slash,
} from "lucide-react";
import { Button } from "./ui/button";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./theme-dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStrava } from "@fortawesome/free-brands-svg-icons";
import { cn } from "@/lib/utils";

const data = {
  navMain: [
    { icon: Home, label: "Home", href: "/" },
    {
      icon: Calendar,
      label: "Schedule",
      href: "/schedule",
      subItems: [
        { icon: Calendar, label: "Calendar", href: "/schedule/calendar" },
      ],
    },
    {
      icon: Dumbbell,
      label: "Workouts",
      href: "/workouts",
      subItems: [
        { icon: PlusCircle, label: "Create", href: "/workouts/create" },
        { icon: Search, label: "Explore", href: "/workouts/explore" },
      ],
    },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.label}>
              {item.subItems ? (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full justify-between",
                        isActive(item.href) &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8 pt-2">
                    {item.subItems.map((subItem) => (
                      <SidebarMenuItem key={subItem.label}>
                        <SidebarMenuButton
                          asChild
                          onClick={() => handleNavigation(subItem.href)}
                          className={cn(
                            isActive(subItem.href) &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <Link
                            href={subItem.href}
                            className="flex items-center space-x-2"
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton
                  asChild
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    isActive(item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <ModeToggle />
            {renderStravaButton()}
          </div>
          <div className="flex space-x-2">
            <ClerkLoaded>
              <UserButton showName afterSignOutUrl="/landing" />
            </ClerkLoaded>
            <ClerkLoading>
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </ClerkLoading>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
