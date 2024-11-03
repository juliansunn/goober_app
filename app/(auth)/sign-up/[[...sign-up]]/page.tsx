import { Loader2 } from "lucide-react";

import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-800">
      <div className="h-full bg-gradient-to-l from-slate-800  to-purple-700 hidden lg:flex items-center justify-center">
        <Image src="/logo.svg" alt="logo" width={100} height={100} />
      </div>
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-16">
          <h1 className="font-bold text-4xl text-slate-100">Welcome!</h1>
          <p className="text-base text-slate-400">
            Create an account or login to get started.
          </p>
        </div>
        <div className="flex items-center justify-center mt-8">
          <ClerkLoaded>
            <SignUp
              path="/sign-up"
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors",
                  footerActionLink: "text-purple-600 hover:text-purple-700",
                },
              }}
            />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="animate-spin" />
          </ClerkLoading>
        </div>
      </div>
    </div>
  );
}
