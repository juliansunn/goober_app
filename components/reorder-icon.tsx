import React from "react";
import { LucideIcon } from "lucide-react";
import { DragControls } from "framer-motion";

interface ReorderIconProps {
  icon: LucideIcon;
  //   dragControls: DragControls;
  className?: string;
}

export const ReorderIcon: React.FC<ReorderIconProps> = ({
  icon: Icon,
  //   dragControls,
  className = "h-5 w-5",
}) => {
  return (
    <div
      className="cursor-grab touch-none"
      //   onPointerDown={(event) => dragControls.start(event)}
    >
      <Icon className={className} />
    </div>
  );
};
export default ReorderIcon;
