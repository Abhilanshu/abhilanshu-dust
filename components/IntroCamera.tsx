"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect } from "react";

interface IntroCameraProps {
    progress: number; // 0 to 1
}

export default function IntroCamera({ progress }: IntroCameraProps) {
    const { camera } = useThree();

    // Start: Far back in the hall, looking center
    const startPos = new THREE.Vector3(0, 5, 40);
    const startTarget = new THREE.Vector3(0, 2, 0);

    // End: The main menu position (where artifacts orbit)
    // Based on page.tsx: <Canvas camera={{ position: [0, 0, 10], fov: 45 }} ...>
    // But we might want it slightly adjusted to match the "center" of the ring
    const endPos = new THREE.Vector3(0, 0, 10);
    const endTarget = new THREE.Vector3(0, 0, 0);

    useFrame(() => {
        // Linear interpolation based on progress
        // Use a ease-out curve for smoother feel: t * (2 - t)
        const t = progress;
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease in-out

        camera.position.lerpVectors(startPos, endPos, ease);

        // Also interpolate where we are looking
        const currentTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, ease);
        camera.lookAt(currentTarget);
    });

    return null;
}
