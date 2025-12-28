"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function FloatingDust({ count = 150 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const x = Math.random() * 100 - 50;
            const y = Math.random() * 100 - 50;
            const z = Math.random() * 100 - 50;
            temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            let { t, factor, speed, x, y, z } = particle;

            // Update time
            t = particle.t += speed / 2;

            // Elliptical movement
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;

            // Update position with slight noise
            const s = Math.cos(t);

            dummy.position.set(
                x + Math.cos(t / 10) * factor + (Math.sin(t * 1) * factor) / 10,
                y + Math.sin(t / 10) * factor + (Math.cos(t * 2) * factor) / 10,
                z + Math.cos(t / 10) * factor + (Math.sin(t * 3) * factor) / 10
            );

            // Scale pulse
            const scale = (s > 0 ? 1 : 0.5) * 0.5; // Small dust size
            dummy.scale.set(scale, scale, scale);

            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <tetrahedronGeometry args={[0.05, 0]} /> {/* Simpler geometry for performance */}
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
}
