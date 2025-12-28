"use client";

import { useEffect, useState } from "react";

interface ScrollIntroProps {
    progress: number; // 0 to 100
    onSkip: () => void;
}

export default function ScrollIntro({ progress, onSkip }: ScrollIntroProps) {
    const [opacity, setOpacity] = useState(1);

    // Fade out as we reach 100%
    useEffect(() => {
        if (progress > 90) {
            setOpacity(1 - (progress - 90) / 10);
        } else {
            setOpacity(1);
        }
    }, [progress]);

    return (
        <div
            className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center"
            style={{ opacity }}
        >
            {/* Top Right Skip Button */}
            <div className="absolute top-8 right-8 pointer-events-auto">
                <button
                    onClick={onSkip}
                    className="flex items-center gap-2 text-white/80 hover:text-white uppercase tracking-[0.2em] text-sm font-medium transition-colors"
                >
                    Skip
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" stroke="none" />
                        <line x1="19" y1="5" x2="19" y2="19" />
                    </svg>
                </button>
            </div>

            {/* Center Content */}
            <div className="absolute top-1/4 w-full flex flex-col items-center gap-8 text-white text-center">
                <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] font-light text-shadow-lg">
                    Moving the Camera
                </h2>

                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <span className="text-lg font-serif">1. Scroll to zoom</span>
                    <div className="w-6 h-10 border border-white/50 rounded-full flex justify-center p-1">
                        <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-24 w-full max-w-md px-8 flex flex-col items-center gap-4">
                {/* Scroll Icon / Percentage */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* Curved arrow or spinner could go here, for now just text */}
                    <span className="text-xl font-bold">{Math.round(progress)}%</span>

                    {/* Circular indicator around text */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="1" fill="none" opacity="0.2" />
                        <circle
                            cx="24" cy="24" r="22"
                            stroke="white" strokeWidth="2" fill="none"
                            strokeDasharray="138"
                            strokeDashoffset={138 - (138 * progress) / 100}
                            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                        />
                    </svg>
                </div>

                {/* Linear Bar */}
                <div className="w-full h-[1px] bg-white/20 relative">
                    <div
                        className="absolute left-0 top-0 h-full bg-white transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
