"use client";

import { EffectComposer, Noise, Vignette, Bloom, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export default function Effects() {
    return (
        <EffectComposer>
            {/* Atmosphere - Subtle Noise */}
            <Noise opacity={0.1} blendFunction={BlendFunction.OVERLAY} />

            {/* Darkens edges to focus attention */}
            <Vignette eskil={false} offset={0.1} darkness={0.8} />

            {/* Cinematic Glow - REDUCED INTENSITY to prevent whiteout */}
            <Bloom
                intensity={0.5}
                luminanceThreshold={0.6}
                luminanceSmoothing={0.8}
                mipmapBlur
            />

            {/* Depth of Field - REDUCED BLUR to improve clarity of text/artifacts */}
            <DepthOfField
                focusDistance={0.02}
                focalLength={0.05}
                bokehScale={1.5}
                height={480}
            />
        </EffectComposer>
    );
}
