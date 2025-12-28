"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Hall({ active = true }: { active?: boolean }) {
    const { scene } = useGLTF("/assets/hall/scene.gltf");
    const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

    useEffect(() => {
        const materials: THREE.MeshStandardMaterial[] = [];
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh;
                m.receiveShadow = true;
                m.castShadow = true;
                if (m.material) {
                    const material = m.material as THREE.MeshStandardMaterial;
                    material.envMapIntensity = 0.5;
                    material.transparent = true; // Enable transparency for fading
                    materials.push(material);
                }
            }
        });
        materialsRef.current = materials;
    }, [scene]);

    useFrame((state, delta) => {
        const targetOpacity = active ? 1 : 0;
        const step = delta * 2; // Fade speed

        // Optimize: Stop updating if already close to target
        const firstMat = materialsRef.current[0];
        if (firstMat && Math.abs(firstMat.opacity - targetOpacity) < 0.01) {
            if (firstMat.opacity !== targetOpacity) {
                materialsRef.current.forEach(m => m.opacity = targetOpacity);
                scene.visible = targetOpacity > 0;
            }
            return;
        }

        scene.visible = true; // Ensure visible while fading

        materialsRef.current.forEach(m => {
            m.opacity = THREE.MathUtils.lerp(m.opacity, targetOpacity, step);
        });
    });

    return <primitive object={scene} scale={[0.5, 0.5, 0.5]} position={[0, -2, 0]} />;
}
