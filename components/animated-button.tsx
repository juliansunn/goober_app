"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const AnimatedButton: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

    const button = buttonRef.current;
    if (button) {
      button.addEventListener("mousemove", handleMouseMove);
      button.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (button) {
        button.removeEventListener("mousemove", handleMouseMove);
        button.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  const isRightSide =
    mousePosition.x > (buttonRef.current?.offsetWidth || 0) / 2;

  const handleClick = () => {
    if (isRightSide) {
      router.push("/sign-in");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <motion.div
      ref={buttonRef}
      className="relative w-64 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-[2px] cursor-pointer overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-slate-800 rounded-full" />
      <motion.div
        className="absolute w-32 h-32 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-75 blur-xl"
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <div className="relative flex items-center justify-center w-full h-full text-white font-bold text-lg">
        <motion.span
          animate={{ opacity: isRightSide ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          Get Started
        </motion.span>
        <motion.span
          className="absolute"
          animate={{ opacity: isRightSide ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          Login
        </motion.span>
      </div>
    </motion.div>
  );
};

export default AnimatedButton;
