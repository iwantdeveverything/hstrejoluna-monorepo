"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence = ({ onComplete }: BootSequenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Full screen canvas
    const setDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setDimensions();

    const charset = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/-=";
    const fontSize = 16;
    let columns = Math.ceil(canvas.width / fontSize);
    let drops: number[] = new Array(columns).fill(1);

    // Redraw matrix rain
    const draw = () => {
      // Semi-transparent black for the fading trail effect
      ctx.fillStyle = "rgba(19, 19, 19, 0.08)"; // Matches --color-void approx
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charset.charAt(Math.floor(Math.random() * charset.length));
        
        // The leading character is white
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // The ones trailing behind are the ember color (matching Dark Kinetic theme)
        ctx.fillStyle = "#FF5637"; 
        ctx.fillText(text, i * fontSize, (drops[i] - 1) * fontSize);

        // Reset drop to top randomly when it hits bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33); // ~30fps for classic retro feel

    // Trigger fade out after 2.5 seconds, then call onComplete
    const bootTimer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        onComplete();
      }, 1000); // 1 second fade out
    }, 2500);

    const handleResize = () => {
      setDimensions();
      columns = Math.ceil(canvas.width / fontSize);
      drops = new Array(columns).fill(1);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      clearTimeout(bootTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isFading ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="fixed inset-0 z-[999] bg-[#131313] flex items-center justify-center pointer-events-none"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* Central Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-void/80 backdrop-blur-md border border-ember/20 px-8 py-4 rounded-full shadow-[0_0_40px_rgba(255,86,55,0.15)]"
          >
            <span className="text-ember font-mono tracking-[0.5em] text-xs font-bold uppercase animate-pulse">
              [ SYSTEM_OVERRIDE ]
            </span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
