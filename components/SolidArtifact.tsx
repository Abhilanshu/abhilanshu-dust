"use client";

import React, { useMemo, useState } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface SolidArtifactProps {
    url: string;
    textures?: Record<string, string>;
    position: [number, number, number];
    rotation: [number, number, number];
    scale?: number;
    onHover: (active: boolean) => void;
    onClick?: () => void;
}

export default function SolidArtifact({
    url,
    textures,
    position,
    rotation,
    scale = 1,
    onHover,
    onClick
}: SolidArtifactProps) {
    const { scene } = useGLTF(url);
    const textureMaps = useTexture(textures || {});

    const [hovered, setHovered] = useState(false);

    // Clone scene to avoid sharing materials heavily if we modify them
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useMemo(() => {
        // Apply Textures & Center
        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        clonedScene.position.sub(center);

        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh;
                m.castShadow = true;
                m.receiveShadow = true;

                if (m.material) {
                    const mat = m.material as THREE.MeshStandardMaterial;
                    mat.envMapIntensity = 1.0;

                    if (textures && Object.keys(textureMaps).length > 0) {
                        const t = textureMaps as any;
                        if (t.map) {
                            mat.map = t.map;
                            if (mat.map) {
                                mat.map.flipY = false;
                                mat.map.colorSpace = THREE.SRGBColorSpace;
                            }
                        }
                        if (t.normalMap) {
                            mat.normalMap = t.normalMap;
                            if (mat.normalMap) mat.normalMap.flipY = false;
                        }
                        if (t.roughnessMap) {
                            mat.roughnessMap = t.roughnessMap;
                            if (mat.roughnessMap) mat.roughnessMap.flipY = false;
                        }
                        if (t.metalnessMap) {
                            mat.metalnessMap = t.metalnessMap;
                            if (mat.metalnessMap) mat.metalnessMap.flipY = false;
                        }
                        if (t.aoMap) {
                            mat.aoMap = t.aoMap;
                            if (mat.aoMap) mat.aoMap.flipY = false;
                        }

                        mat.color.setHex(0xffffff);
                        mat.metalness = 1.0;
                        mat.roughness = 1.0;
                        mat.needsUpdate = true;
                    } else {
                        // Fallback default
                        // Keep original material or set default
                    }
                }
            }
        });
    }, [clonedScene, textureMaps, textures]);

    const handlePointerOver = (e: any) => {
        e.stopPropagation();
        setHovered(true);
        onHover(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = (e: any) => {
        setHovered(false);
        onHover(false);
        document.body.style.cursor = 'auto';
    };

    return (
        <group
            position={position}
            rotation={new THREE.Euler(...rotation)}
            scale={[scale, scale, scale]}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            <primitive object={clonedScene} />

            {/* Optional Highlight on Hover */}
            {hovered && (
                <pointLight position={[0, 2, 0]} intensity={2} distance={5} color="#ffdcae" />
            )}
        </group>
    );
}
