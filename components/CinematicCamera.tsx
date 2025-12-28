"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STORIES, StoryKey } from "@/config/stories";

export default function CinematicCamera({ selectedStory }: { selectedStory: string | null }) {
    const { camera } = useThree();
    const [targetCamera, setTargetCamera] = useState<THREE.Camera | null>(null);

    // Load all camera animations
    // Note: In a real app we might load these lazily or preload them.
    // For now, let's load the active one or a generic one.
    // Actually, hooks order must be static. We can't conditionally call useGLTF.
    // We can pre-load or just load a generic holder.
    // Better approach: A component that mounts when story is selected.

    // BUT, we need smooth transition.

    // Let's rely on the fact that we have a specific glb for each.
    // We will create a sub-component for the active story camera.
    return (
        <>
            {selectedStory ? (
                <StoryCamera storyKey={selectedStory as StoryKey} />
            ) : (
                <IdleCamera />
            )}
        </>
    );
}

function IdleCamera() {
    useFrame((state, delta) => {
        // Smooth drift for idle state
        const time = state.clock.elapsedTime;
        const targetPos = new THREE.Vector3(0, 0, 8); // Home position
        state.camera.position.lerp(targetPos, delta * 2);

        // Gentle rotation
        state.camera.rotation.z = Math.sin(time * 0.1) * 0.02;
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}

function StoryCamera({ storyKey }: { storyKey: StoryKey }) {
    const { camera } = useThree();
    const glbUrl = STORIES[storyKey].camera;
    const { animations, scene } = useGLTF(glbUrl);

    // Create a mixer for the scene
    const { actions, names } = useAnimations(animations, scene);

    useEffect(() => {
        // Find the camera in the GLB
        // Assumes the GLB has a camera node.
        let foundCam: THREE.Camera | null = null;
        scene.traverse((obj) => {
            if ((obj as THREE.Camera).isCamera) {
                foundCam = obj as THREE.Camera;
            }
        });

        if (foundCam) {
            // Play the first animation found
            if (names.length > 0) {
                const action = actions[names[0]];
                if (action) {
                    action.reset().play();
                    action.setLoop(THREE.LoopOnce, 1);
                    action.clampWhenFinished = true;
                }
            }
        }
    }, [storyKey, actions, names, scene]);

    useFrame((state, delta) => {
        // Sync main camera to the GLB camera
        let foundCam: THREE.Camera | null = null;
        scene.traverse((obj) => {
            if ((obj as THREE.Camera).isCamera) {
                foundCam = obj as THREE.Camera;
            }
        });

        if (foundCam) {
            // Need to update the mixer? useAnimations handles mixer update via useFrame automatically?
            // Yes, userAnimations uses useFrame.

            // Copy transform
            const cam = foundCam as THREE.Camera;
            cam.updateMatrixWorld();
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            cam.getWorldPosition(worldPos);
            cam.getWorldQuaternion(worldQuat);

            state.camera.position.lerp(worldPos, 0.1); // Smooth transition to the track
            state.camera.quaternion.slerp(worldQuat, 0.1);
        }
    });

    return <primitive object={scene} visible={false} />;
}
