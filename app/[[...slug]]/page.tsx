"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, Float, ContactShadows, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { STORIES, StoryKey } from "@/config/stories";
import { Howl } from 'howler';
import FloatingDust from "@/components/FloatingDust";
import Effects from "@/components/Effects";
import SolidArtifact from "@/components/SolidArtifact";
import Hall from "@/components/Hall";
import CinematicCamera from "@/components/CinematicCamera";
import AppLoader from "@/components/AppLoader";
import ScrollIntro from "@/components/ScrollIntro";
import IntroCamera from "@/components/IntroCamera";
import { useParams, useRouter } from "next/navigation";

// --- AUDIO MANAGER ---
const MENU_AUDIO = {
    bg: new Howl({ src: ['/assets/background.mp3'], loop: true, volume: 0.3 }),
    hover: new Howl({ src: ['/assets/ui-clack.mp3'], volume: 0.1 }),
    touch: new Howl({ src: ['/assets/ui-click.mp3'], volume: 0.2 }),
    drone: new Howl({ src: ['/assets/ui-object-drone.mp3'], volume: 0.1, loop: true }),
};

function AudioController({ isMuted }: { isMuted: boolean }) {
    useEffect(() => {
        if (!isMuted) {
            if (!MENU_AUDIO.bg.playing()) MENU_AUDIO.bg.play();
        } else {
            MENU_AUDIO.bg.pause();
        }
    }, [isMuted]);
    return null;
}

// --- TEXTURE MAPPINGS ---
const TEXTURES = {
    helmet: {
        map: '/assets/helmet%20(2).jpg',
        normalMap: '/assets/helmet.high.n%20(1).jpg',
        roughnessMap: '/assets/helmet.r%20(2).jpg',
        metalnessMap: '/assets/helmet.m%20(2).jpg',
        aoMap: '/assets/helmet.ao%20(2).jpg',
    },
    front: {
        map: '/assets/front%20(2).jpg',
        normalMap: '/assets/front.high.n%20(1).jpg',
        roughnessMap: '/assets/front.r%20(2).jpg',
        metalnessMap: '/assets/front.m%20(2).jpg',
        aoMap: '/assets/front.ao%20(2).jpg',
    },
    frontskirt: {
        map: '/assets/frontskirt%20(2).jpg',
        normalMap: '/assets/frontskirt.high.n%20(1).jpg',
        roughnessMap: '/assets/frontskirt.r%20(2).jpg',
        metalnessMap: '/assets/frontskirt.m%20(2).jpg',
        aoMap: '/assets/frontskirt.ao%20(2).jpg',
    },
    shoulderl: {
        map: '/assets/shoulderl%20(2).jpg',
        normalMap: '/assets/shoulderl.high.n%20(1).jpg',
        roughnessMap: '/assets/shoulderl.r%20(2).jpg',
        metalnessMap: '/assets/shoulderl.m%20(2).jpg',
        aoMap: '/assets/shoulderl.ao%20(2).jpg',
    },
    shoulderr: {
        map: '/assets/shoulderr%20(2).jpg',
        normalMap: '/assets/shoulderr.high.n%20(1).jpg',
        roughnessMap: '/assets/shoulderr.r%20(2).jpg',
        metalnessMap: '/assets/shoulderr.m%20(2).jpg',
        aoMap: '/assets/shoulderr.ao%20(2).jpg',
    },
    boot: {
        map: '/assets/boot%20(2).jpg',
        normalMap: '/assets/boot.high.n%20(1).jpg',
        roughnessMap: '/assets/boot.r%20(2).jpg',
        metalnessMap: '/assets/boot.m%20(2).jpg',
        aoMap: '/assets/boot.high.ao%20(2).jpg',
    },
    rifle: {
        map: '/assets/rifle%20(2).jpg',
        normalMap: '/assets/rifle.high.n%20(1).jpg',
        roughnessMap: '/assets/rifle.r%20(2).jpg',
        metalnessMap: '/assets/rifle.m%20(2).jpg',
        aoMap: '/assets/rifle.ao%20(2).jpg',
    },
    mask: {
        map: '/assets/deathmask.high.75%20(2).jpg',
        normalMap: '/assets/deathmask.high.n%20(1).jpg',
        roughnessMap: '/assets/deathmask.r%20(2).jpg',
    },
};

// --- ORBIT LAYOUT CONFIGURATION ---
const ORBIT_RADIUS = 5;
const ARTIFACT_ORDER: StoryKey[] = ['armor', 'rifle', 'boot', 'mask', 'letter'];

function getOrbitPosition(index: number, total: number, radius: number): [number, number, number] {
    const angle = (index / total) * Math.PI * 2;
    return [Math.sin(angle) * radius, 0, Math.cos(angle) * radius];
}

// --- UI ICONS ---
const ICONS = {
    armor: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8">
            {/* Bucket Helm shape */}
            <path d="M5 21h14v-9a7 7 0 0 0-14 0v9z" />
            <path d="M4 21h16" />
            <path d="M8 8h8" />
            <path d="M12 8v8" />
        </svg>
    ),
    rifle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 -rotate-45">
            {/* Musket shape */}
            <path d="M2 20l4 2 16-16-2-2L4 20z" />
            <path d="M6 18l3-3" />
        </svg>
    ),
    boot: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8">
            {/* Boot Profile */}
            <path d="M5 22h8a2 2 0 0 0 2-2V12l3-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18z" />
            <path d="M6 16h6" />
        </svg>
    ),
    mask: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8">
            {/* Kelly Mask shape */}
            <path d="M4 22V10a8 8 0 0 1 16 0v12" />
            <path d="M7 6h10" />
            <path d="M8 12h8" />
        </svg>
    ),
    letter: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8">
            {/* Folded Paper */}
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    ),
    settings: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    volume: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    ),
    ad: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="4" />
            <path d="M8 15h2v-4h-2M14 15h2v-4h-2" />
            <path d="M18 10c1 0 2 .5 2 2s-1 2-2 2" />
            <path d="M6 10c-1 0-2 .5-2 2s1 2 2 2" />
        </svg>
    )
};

// --- UI COMPONENTS ---

function IntroOverlay({ onEnter }: { onEnter: () => void }) {
    const [visible, setVisible] = useState(true);
    const handleEnter = () => {
        setVisible(false);
        onEnter();
    };
    if (!visible) return null;
    return (
        <div
            className="transition-opacity duration-1000"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100vw',
                height: '100vh',
                color: 'white'
            }}
        >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <div className="mb-12 opacity-80">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" /></svg>
                </div>

                {/* Main Title - Serif, Centered */}
                <h1 className="text-4xl md:text-8xl tracking-[0.15em] font-serif text-black uppercase mb-16 text-center drop-shadow-xl leading-none whitespace-nowrap">
                    Mouthful of Dust
                </h1>

                <button
                    onClick={() => { MENU_AUDIO.touch.play(); handleEnter(); }}
                    onMouseEnter={() => MENU_AUDIO.hover.play()}
                    className="px-12 py-4 border border-white/80 text-white hover:bg-white hover:text-black transition-all uppercase tracking-[0.25em] text-xs font-bold bg-transparent backdrop-blur-sm"
                >
                    Enter
                </button>

                <div className="mt-16 text-white/50 text-[10px] tracking-widest uppercase text-center flex flex-col gap-2">
                    <span className="border border-white/20 px-3 py-1 inline-block mx-auto rounded-full">A State Library Victoria Exhibition</span>
                </div>
            </div>
        </div>
    );
}

const CinematicOverlay = ({ storyKey, onClose, onNext, onPrev, onSelect, isMuted }: { storyKey: string, onClose: () => void, onNext: () => void, onPrev: () => void, onSelect: (k: StoryKey) => void, isMuted: boolean }) => {
    const data = STORIES[storyKey as StoryKey];
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<Howl | null>(null);

    useEffect(() => {
        if (audioRef.current) audioRef.current.unload();
        if (data.audio) {
            audioRef.current = new Howl({
                src: [data.audio],
                html5: true,
                volume: 0.8,
                autoplay: true,
                mute: isMuted,
                onend: () => setPlaying(false),
                onplay: () => setPlaying(true)
            });
            if (audioRef.current.playing()) setPlaying(true);
        }
        return () => { audioRef.current?.unload(); };
    }, [storyKey, data.audio, isMuted]);

    // Update mute state dynamically if it changes during playback
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.mute(isMuted);
        }
    }, [isMuted]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
        setPlaying(!playing);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 30,
                pointerEvents: 'none',
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            {/* Top Bar */}
            <div className="w-full p-8 flex justify-end items-start pointer-events-none fade-in relative z-50">
                <div
                    className="w-10 h-10 flex flex-col justify-center gap-2 items-end cursor-pointer pointer-events-auto opacity-70 hover:opacity-100"
                    onClick={() => { MENU_AUDIO.touch.play(); onClose(); }}
                    onMouseEnter={() => MENU_AUDIO.hover.play()}
                >
                    <div className="w-8 h-px bg-white"></div>
                    <div className="w-8 h-px bg-white"></div>
                    <div className="w-8 h-px bg-white"></div>
                </div>
            </div>

            {/* Main Content - ABSOLUTE CENTER */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                width: '100%',
                maxWidth: '1200px'
            }}>
                <div className="pointer-events-auto flex flex-col items-center w-full px-4">
                    <h3 className="text-white/80 text-xs md:text-sm uppercase tracking-[0.3em] font-medium mb-6 fade-in-up text-center w-full">
                        {data.narrator || "Narrator"}
                    </h3>
                    <h1 className="text-4xl md:text-7xl text-white font-thin tracking-[0.2em] uppercase mb-10 fade-in-up delay-100 text-center w-full leading-tight drop-shadow-lg whitespace-nowrap">
                        {data.title}
                    </h1>

                    <button
                        onClick={() => { MENU_AUDIO.touch.play(); togglePlay(); }}
                        onMouseEnter={() => MENU_AUDIO.hover.play()}
                        className="group flex items-center gap-4 px-8 py-3 border border-white/40 hover:border-white hover:bg-white transition-all bg-transparent backdrop-blur-[0px] fade-in-up delay-200 pointer-events-auto"
                    >
                        <div className="w-3 h-3 text-white fill-current group-hover:text-black transition-colors">
                            {playing ? (
                                <div className="w-3 h-3 bg-white group-hover:bg-black" />
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            )}
                        </div>
                        <span className="text-white text-[10px] uppercase tracking-[0.25em] font-medium group-hover:text-black transition-colors">
                            {playing ? 'Pause' : 'Play'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Arrows - Fixed Left/Right */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    transform: 'translateY(-50%)',
                    zIndex: 40,
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 40px',
                    pointerEvents: 'none'
                }}
            >
                <button
                    onClick={() => { MENU_AUDIO.touch.play(); onPrev(); }}
                    onMouseEnter={() => MENU_AUDIO.hover.play()}
                    className="group pointer-events-auto transition-transform hover:scale-110 focus:outline-none"
                    aria-label="Previous Story"
                >
                    {/* Elegant Long Arrow Left */}
                    <div className="relative w-16 h-16 flex items-center justify-center border border-white/10 rounded-full bg-black/20 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="opacity-70 group-hover:opacity-100 transition-opacity">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </div>
                </button>
                <button
                    onClick={() => { MENU_AUDIO.touch.play(); onNext(); }}
                    onMouseEnter={() => MENU_AUDIO.hover.play()}
                    className="group pointer-events-auto transition-transform hover:scale-110 focus:outline-none"
                    aria-label="Next Story"
                >
                    {/* Elegant Long Arrow Right */}
                    <div className="relative w-16 h-16 flex items-center justify-center border border-white/10 rounded-full bg-black/20 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="opacity-70 group-hover:opacity-100 transition-opacity">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Bottom Bar */}
            <div className="w-full px-8 pb-8 flex items-end justify-between pointer-events-auto fade-in z-50">
                <div className="flex gap-6 text-white/50">
                    <button className="hover:text-white transition-colors">{ICONS.settings}</button>
                    <button className="hover:text-white transition-colors">{ICONS.volume}</button>
                </div>

                <div className="flex gap-8 md:gap-12 pb-2">
                    {ARTIFACT_ORDER.map((key) => (
                        <button
                            key={key}
                            onClick={() => { MENU_AUDIO.touch.play(); onSelect(key); }}
                            onMouseEnter={() => MENU_AUDIO.hover.play()}
                            className={`flex flex-col items-center gap-4 group transition-all duration-500 ${storyKey === key ? 'text-white' : 'text-white/30 hover:text-white/70'}`}
                        >
                            <div className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                                {ICONS[key as keyof typeof ICONS] || ICONS.armor}
                            </div>
                            <div className={`w-1 h-1 rounded-full bg-white transition-all ${storyKey === key ? 'opacity-100 scale-150' : 'opacity-0'}`} />
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 text-white/50">
                    <button className="hover:text-white transition-colors">{ICONS.ad}</button>
                </div>
            </div>
        </div>
    );
}

function SceneContent({ selectedStory, onSelect, activeHover, onHover, introPhase, scrollProgress }: { selectedStory: string | null, onSelect: (k: string) => void, activeHover: string | null, onHover: (k: string | null) => void, introPhase: 'title' | 'scroll' | 'explore', scrollProgress: number }) {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);
    const storyRef = useRef(selectedStory);

    useEffect(() => {
        storyRef.current = selectedStory;
    }, [selectedStory]);

    // Rotate ring to face select artifact
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        let targetRotation = 0;
        const currentStory = storyRef.current;

        if (currentStory) {
            const index = ARTIFACT_ORDER.indexOf(currentStory as StoryKey);
            if (index !== -1) {
                const angle = (index / ARTIFACT_ORDER.length) * Math.PI * 2;
                targetRotation = -angle;
            }
        } else {
            targetRotation = 0;
        }

        const currentRot = groupRef.current.rotation.y;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, targetRotation, delta * 2);
    });

    return (
        <>
            <Environment files="/assets/env.hdr" blur={0.8} background={false} />

            <Suspense fallback={null}>
                {selectedStory && <CinematicCamera selectedStory={selectedStory} />}
                {introPhase === 'scroll' && <IntroCamera progress={scrollProgress / 100} />}
            </Suspense>

            {/* Lighting */}
            <ambientLight intensity={0.02} />
            <directionalLight position={[5, 10, 5]} intensity={0.2} />

            <spotLight
                position={[0, 10, 2]}
                intensity={1.0}
                angle={0.5}
                penumbra={1}
                distance={20}
                color="#eef2ff"
            />
            <pointLight position={[0, 2, -5]} intensity={0.5} color="#203050" distance={15} />

            <Hall active={!selectedStory} />

            {/* CENTRAL ORBIT RING */}
            <group position={[0, -1, 0]} ref={groupRef} visible={introPhase === 'explore' || introPhase === 'scroll'}>

                {/* ARMOR (Index 0) */}
                <group position={getOrbitPosition(0, ARTIFACT_ORDER.length, ORBIT_RADIUS) as any} rotation={[0, 0, 0]}>
                    <group rotation={[0, Math.PI, 0]}>
                        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
                            <SolidArtifact url="/assets/helmet.high.glb" position={[0, 1.8, 0]} rotation={[0.1, 0, 0]} scale={4.5} textures={TEXTURES.helmet}
                                onHover={(a) => onHover(a ? 'armor' : null)} onClick={() => onSelect('armor')} />
                            <SolidArtifact url="/assets/front.high.glb" position={[0, 0.2, 0]} rotation={[0, 0, 0]} scale={4.5} textures={TEXTURES.front} onHover={() => { }} />
                            <SolidArtifact url="/assets/frontskirt.high.glb" position={[0, -1.8, 0.2]} rotation={[-0.1, 0, 0]} scale={4.5} textures={TEXTURES.frontskirt} onHover={() => { }} />
                            <SolidArtifact url="/assets/shoulderl.high.glb" position={[-1.2, 0.8, 0.3]} rotation={[0, 0, 0.2]} scale={4.5} textures={TEXTURES.shoulderl} onHover={() => { }} />
                            <SolidArtifact url="/assets/shoulderr.high.glb" position={[1.2, 0.8, 0.3]} rotation={[0, 0, -0.2]} scale={4.5} textures={TEXTURES.shoulderr} onHover={() => { }} />
                        </Float>
                    </group>
                </group>

                {/* RIFLE (Index 1) */}
                <group position={getOrbitPosition(1, ARTIFACT_ORDER.length, ORBIT_RADIUS) as any}>
                    <group rotation={[0, Math.PI + (Math.PI / 2), 0]}>
                        <Float speed={1.2}>
                            <SolidArtifact url={STORIES.rifle.model} position={[0, 0, 0]} rotation={[0, 0, -0.8]} scale={3.8} textures={TEXTURES.rifle}
                                onHover={(a) => onHover(a ? 'rifle' : null)} onClick={() => onSelect('rifle')} />
                        </Float>
                    </group>
                </group>

                {/* BOOT (Index 2) */}
                <group position={getOrbitPosition(2, ARTIFACT_ORDER.length, ORBIT_RADIUS) as any}>
                    <group rotation={[0, 0, 0]}>
                        <Float speed={1.8}>
                            <SolidArtifact url={STORIES.boot.model} position={[0, 0, 0]} rotation={[0, -0.5, 0.2]} scale={3.5} textures={TEXTURES.boot}
                                onHover={(a) => onHover(a ? 'boot' : null)} onClick={() => onSelect('boot')} />
                        </Float>
                    </group>
                </group>

                {/* MASK (Index 3) */}
                <group position={getOrbitPosition(3, ARTIFACT_ORDER.length, ORBIT_RADIUS) as any}>
                    <group rotation={[0, -Math.PI / 2, 0]}>
                        <Float speed={2.0}>
                            <SolidArtifact url={STORIES.mask.model} position={[0, 0, 0]} rotation={[0, 0.5, 0]} scale={3.5} textures={TEXTURES.mask}
                                onHover={(a) => onHover(a ? 'mask' : null)} onClick={() => onSelect('mask')} />
                        </Float>
                    </group>
                </group>

                {/* LETTER (Index 4) */}
                <group position={getOrbitPosition(4, ARTIFACT_ORDER.length, ORBIT_RADIUS) as any}>
                    <group rotation={[0, -Math.PI / 2, 0]}>
                        <Float speed={1.0}>
                            <SolidArtifact url={STORIES.letter.model} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={15.0} textures={{}}
                                onHover={(a) => onHover(a ? 'letter' : null)} onClick={() => onSelect('letter')} />
                        </Float>
                    </group>
                </group>

            </group>

            {/* Removed FloatingDust and Effects for performance and clarity */}
            {/* <FloatingDust count={150} /> */}
            {/* <Effects /> */}

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={!selectedStory && introPhase === 'explore'}
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 1.8}
                minPolarAngle={Math.PI / 2.2}
                enabled={!selectedStory && introPhase === 'explore'}
            />
        </>
    );
}


export default function MainMenu() {
    const [activeStory, setActiveStory] = useState<string | null>(null);
    const [selectedStory, setSelectedStory] = useState<StoryKey | null>(null);
    const [muted, setMuted] = useState(true);
    const [loaded, setLoaded] = useState(false);

    // New State for Cinematic Scroll
    const [introPhase, setIntroPhase] = useState<'title' | 'scroll' | 'explore'>('title');
    const [scrollProgress, setScrollProgress] = useState(0);

    const params = useParams();
    const router = useRouter();

    // Route Synchronization
    useEffect(() => {
        if (params.slug && params.slug[0]) {
            const slug = params.slug[0];
            if (ARTIFACT_ORDER.includes(slug as StoryKey)) {
                setSelectedStory(slug as StoryKey);
                setIntroPhase('explore'); // Skip intro if deep linking
                setMuted(false);
            }
        } else {
            setSelectedStory(null);
        }
    }, [params.slug]);

    const handleStorySelect = (key: StoryKey | null) => {
        setSelectedStory(key);
        if (key) {
            window.history.pushState(null, '', `/${key}`);
        } else {
            window.history.pushState(null, '', '/');
        }
    };

    const handleEnter = () => {
        setIntroPhase('scroll');
        setMuted(false);
    };

    const skipScroll = () => {
        setScrollProgress(100);
        setTimeout(() => setIntroPhase('explore'), 500);
    };

    // Scroll Handler
    useEffect(() => {
        if (introPhase !== 'scroll') return;

        const handleWheel = (e: WheelEvent) => {
            setScrollProgress(prev => {
                const newProgress = Math.min(Math.max(prev + e.deltaY * 0.05, 0), 100);
                if (newProgress >= 100) {
                    setTimeout(() => setIntroPhase('explore'), 500);
                }
                return newProgress;
            });
        };

        // Touch support for mobile
        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
        const handleTouchMove = (e: TouchEvent) => {
            const deltaY = touchStartY - e.touches[0].clientY;
            setScrollProgress(prev => {
                const newProgress = Math.min(Math.max(prev + deltaY * 0.1, 0), 100);
                if (newProgress >= 100) {
                    setTimeout(() => setIntroPhase('explore'), 500);
                }
                return newProgress;
            });
            touchStartY = e.touches[0].clientY; // Reset for continuous drag
        };

        window.addEventListener('wheel', handleWheel);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [introPhase]);


    const cycleStory = (direction: 'next' | 'prev') => {
        if (!selectedStory) return;
        const currentIdx = ARTIFACT_ORDER.indexOf(selectedStory);
        let newIdx;
        if (direction === 'next') {
            newIdx = (currentIdx + 1) % ARTIFACT_ORDER.length;
        } else {
            newIdx = (currentIdx - 1 + ARTIFACT_ORDER.length) % ARTIFACT_ORDER.length;
        }
        const newKey = ARTIFACT_ORDER[newIdx];
        handleStorySelect(newKey);
    };

    return (
        <main className="h-screen w-screen bg-black overflow-hidden relative font-sans select-none text-white">
            <AppLoader onFinished={() => setLoaded(true)} />

            {/* VIGNETTE ALWAYS ON TOP */}
            <div className="blue-vignette pointer-events-none" />

            {loaded && <AudioController isMuted={muted} />}

            {loaded && introPhase === 'title' && <IntroOverlay onEnter={handleEnter} />}

            {introPhase === 'scroll' && (
                <ScrollIntro progress={scrollProgress} onSkip={skipScroll} />
            )}

            {selectedStory && (
                <CinematicOverlay
                    storyKey={selectedStory}
                    onClose={() => handleStorySelect(null)}
                    onNext={() => cycleStory('next')}
                    onPrev={() => cycleStory('prev')}
                    onSelect={handleStorySelect}
                    isMuted={muted}
                />
            )}

            <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 1.5]}>
                <Suspense fallback={null}>
                    <SceneContent
                        selectedStory={selectedStory}
                        onSelect={(k) => handleStorySelect(k as StoryKey)}
                        activeHover={activeStory}
                        onHover={setActiveStory}
                        introPhase={introPhase}
                        scrollProgress={scrollProgress}
                    />
                </Suspense>
            </Canvas>

            {!selectedStory && activeStory && introPhase === 'explore' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-500 z-10 w-full text-center">
                    <h2 className="text-5xl md:text-8xl font-thin tracking-[0.1em] uppercase text-shadow-xl blur-[0.5px] opacity-90 mx-auto w-fit">
                        {STORIES[activeStory as StoryKey]?.title}
                    </h2>
                </div>
            )}

        </main>
    );
}
