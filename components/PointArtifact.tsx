"use client";

import React, { useMemo, useRef, useState } from 'react';
import { useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { useGLTF, useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { mergeBufferGeometries } from 'three-stdlib';

// --- CUSTOM SHADER MATERIAL ---
const PointCloudMaterial = shaderMaterial(
    {
        uMap: new THREE.Texture(),
        uSize: 4.0,
        uOpacity: 1.0,
        uColor: new THREE.Color(1, 1, 1),
        uTime: 0,
    },
    // Vertex Shader
    `
    uniform float uSize;
    uniform float uTime;
    varying vec2 vUv;
    varying float vVisibility;

    // Pseudo-random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Subtle breathing animation
      float noise = sin(pos.x * 2.0 + uTime) * cos(pos.y * 2.0 + uTime) * 0.02;
      pos += normal * noise;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_PointSize = uSize * (20.0 / -mvPosition.z);

      // Randomly hide some points for "shimmer" effect
      float r = random(uv + fract(uTime * 0.1));
      
      // Only keep some points visible per frame for "dusty" shimmering look
      // But ensure stability
      vVisibility = 1.0; 

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
    // Fragment Shader
    `
    uniform sampler2D uMap;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    varying float vVisibility;

    void main() {
      if (vVisibility < 0.5) discard;

      // Sample texture
      vec4 texColor = texture2D(uMap, vUv);
      
      // Circular point
      vec2 cxy = 2.0 * gl_PointCoord - 1.0;
      if (dot(cxy, cxy) > 1.0) discard;

      // Multiply texture color with base color
      gl_FragColor = vec4(texColor.rgb * uColor, uOpacity);
    }
  `
);

extend({ PointCloudMaterial });

interface PointArtifactProps {
    url: string;
    textures?: Record<string, string>;
    position: [number, number, number];
    rotation: [number, number, number];
    scale?: number;
    onHover: (active: boolean) => void;
    onClick?: () => void;
    pointSize?: number;
}

export default function PointArtifact({
    url,
    textures,
    position,
    rotation,
    scale = 1,
    onHover,
    onClick,
    pointSize = 3.0
}: PointArtifactProps) {
    const { scene } = useGLTF(url);
    const textureMaps = useTexture(textures || {});

    // Ref for the material to update uniforms
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Extract geometry and prepare map
    const [geometry, map] = useMemo(() => {
        const geometries: THREE.BufferGeometry[] = [];
        let mainMap: THREE.Texture | null = null;

        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                // Apply world matrix to geometry to preserve relative positions if merging
                const clonedGeo = mesh.geometry.clone();
                // Reset local transform logic: we want relative to the group root.
                // But gltf meshes might be nested. 
                // Simple approach: Apply the child's matrix to the geometry.
                mesh.updateMatrixWorld();
                clonedGeo.applyMatrix4(mesh.matrix);
                geometries.push(clonedGeo);
            }
        });

        // Merge geometries
        const merged = geometries.length > 0 ? mergeBufferGeometries(geometries) : null;

        if (merged) {
            // Recenter to origin
            merged.computeBoundingBox();
            const center = new THREE.Vector3();
            merged.boundingBox?.getCenter(center);
            merged.translate(-center.x, -center.y, -center.z);
        }

        if (textureMaps) {
            const t = textureMaps as any;
            if (t.map) mainMap = t.map;
        }

        if (mainMap) {
            mainMap.flipY = false;
            mainMap.colorSpace = THREE.SRGBColorSpace;
        }

        return [merged, mainMap];
    }, [scene, textureMaps]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const [hovered, setHovered] = useState(false);

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

    if (!geometry) return null;

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
            <points geometry={geometry}>
                {/* @ts-ignore */}
                <pointCloudMaterial
                    ref={materialRef}
                    transparent
                    depthWrite={false}
                    uMap={map || new THREE.Texture()}
                    uSize={hovered ? pointSize * 1.5 : pointSize} // Grow on hover
                    uOpacity={1.0}
                    uColor={!map ? new THREE.Color(0.8, 0.6, 0.4) : new THREE.Color(1, 1, 1)}
                />
            </points>
            {/* Invisible mesh for raycasting */}
            <mesh geometry={geometry} visible={false}>
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
        </group>
    );
}
