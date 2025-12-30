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
                    // Clone material to avoid sharing issues
                    const originalMaterial = m.material as THREE.MeshStandardMaterial;
                    const material = originalMaterial.clone();

                    // Apply realistic stone/dust palette instead of random colors
                    // Warm grey/sand color
                    material.color.setHex(0xeae5d5);

                    // Add some subtle variation based on position or random to avoid flat look
                    // but keep it within the "stone" range
                    const variation = (Math.random() - 0.5) * 0.1;
                    material.color.offsetHSL(0, 0, variation);


                    material.envMapIntensity = 0.8;
                    material.roughness = 0.7;
                    material.transparent = true; // Enable transparency for fading
                    m.material = material; // Assign the new unique material
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

    // Rotate 90 degrees to align long axis with camera approach
    return <primitive object={scene} scale={[0.5, 0.5, 0.5]} position={[0, -2, 0]} rotation={[0, -Math.PI / 2, 0]} />;
}
