import { Loader2 } from "lucide-react";

export function LoadingCenter() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}
