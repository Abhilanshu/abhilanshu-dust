"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function AppLoader({ onFinished }: { onFinished: () => void }) {
    const { active, progress } = useProgress();
    const [displayProgress, setDisplayProgress] = useState(0);
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        // Smooth interpolation for the loader
        if (progress > displayProgress) {
            const timer = setTimeout(() => {
                setDisplayProgress(old => Math.min(old + 1, progress));
            }, 20); // Slower update for drama
            return () => clearTimeout(timer);
        } else if (progress === 100 && displayProgress >= 99) {
            // Add a small delay after 100% before finishing
            const finishTimer = setTimeout(() => {
                setComplete(true);
                setTimeout(onFinished, 1000); // Allow fade out
            }, 800);
            return () => clearTimeout(finishTimer);
        }
    }, [progress, displayProgress, onFinished]);

    if (!active && complete) return null;

    return (
        <div
            className={`transition-opacity duration-1000 ${complete ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                backgroundColor: 'black',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0
            }}
        >
            <div className="relative flex flex-col items-center justify-center text-center">
                <div className="text-4xl md:text-6xl font-thin tracking-[0.3em] uppercase mb-12 blur-[0.5px] text-center whitespace-nowrap">
                    Mouthful of Dust
                </div>
                {/* Gradient Overlay for subtle look */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-50 pointer-events-none"></div>
            </div>

            <div className="w-64 h-[1px] bg-white/20 mb-4 relative overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-white transition-all duration-300 ease-out"
                    style={{ width: `${displayProgress}%` }}
                />
            </div>

            <div className="text-[10px] uppercase text-white/40 tracking-widest flex items-center justify-center gap-4">
                <span>Loading Assets</span>
                <span className="text-white">{Math.floor(displayProgress)}%</span>
            </div>
        </div>
    );
}
