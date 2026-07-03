'use client';

import { CameraControls, Environment, Preload, useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useCustomizerControls } from './context';
import { asImageSrc } from '@prismicio/client';
import { Skateboard } from '@/components/Skateboard';
import * as THREE from 'three';

const DEFAULT_WHEEL_TEXTURE = '/skateboard/SkateWheel1.png';
const DEFAULT_DECK_TEXTURE = '/skateboard/Deck.webp';
const DEFAULT_TRUCK_COLOR = '#6f6e6a';
const DEFAULT_BOLT_COLOR = '#6f6e6a';
const ENVIRONMENT_COLOR = '#3b3a3a';

type Props = {
    wheelTextureUrls: string[];
    deckTextureUrls: string[];
};

export function Preview({ wheelTextureUrls, deckTextureUrls }: Props) {
    const cameraControls = useRef<CameraControls>(null);
    const floorRef = useRef<THREE.Mesh>(null);

    const { selectedWheel, selectedDeck, selectedBolt, selectedTruck } = useCustomizerControls();

    const wheelTextureUrl = asImageSrc(selectedWheel?.texture) ?? DEFAULT_WHEEL_TEXTURE;
    const deckTextureUrl = asImageSrc(selectedDeck?.texture) ?? DEFAULT_DECK_TEXTURE;
    const truckColor = selectedTruck?.color ?? DEFAULT_TRUCK_COLOR;
    const boltColor = selectedBolt?.color ?? DEFAULT_BOLT_COLOR;

    function onCameraControlStart() {
        if (
            !cameraControls.current ||
            !floorRef.current ||
            cameraControls.current.colliderMeshes.length > 0
        )
            return;

        cameraControls.current.colliderMeshes = [floorRef.current];
    }

    function setCameraControls(target: THREE.Vector3, pos: THREE.Vector3) {
        if (!cameraControls.current) return;

        cameraControls.current.setTarget(target.x, target.y, target.z, true);
        cameraControls.current.setPosition(pos.x, pos.y, pos.z, true);
    }

    useEffect(() => {
        setCameraControls(new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(1.5, 0.8, 0));
    }, [selectedDeck]);

    useEffect(() => {
        setCameraControls(new THREE.Vector3(-0.12, 0.29, 0.57), new THREE.Vector3(0.1, 0.25, 0.9));
    }, [selectedTruck]);

    useEffect(() => {
        setCameraControls(new THREE.Vector3(-0.08, 0.54, 0.64), new THREE.Vector3(0.09, 1, 0.9));
    }, [selectedWheel]);

    useEffect(() => {
        setCameraControls(new THREE.Vector3(-0.25, 0.3, 0.62), new THREE.Vector3(-0.5, 0.35, 0.8));
    }, [selectedBolt]);

    return (
        <Canvas shadows camera={{ position: [2.5, 1, 0], fov: 50 }}>
            <Suspense fallback={null}>
                <Environment files={'/hdr/warehouse-512.hdr'} environmentIntensity={0.6} />
                <directionalLight
                    castShadow
                    lookAt={[0, 0, 0]}
                    position={[1, 1, 1]}
                    intensity={1.6}
                />
                <fog attach={'fog'} args={[ENVIRONMENT_COLOR, 3, 10]} />
                <color attach={'background'} args={[ENVIRONMENT_COLOR]} />
                <StageFloor />

                <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[6, 6]} />
                    <meshBasicMaterial visible={false} />
                </mesh>

                <Skateboard
                    wheelTextureUrls={wheelTextureUrls}
                    wheelTextureUrl={wheelTextureUrl}
                    deckTextureUrls={deckTextureUrls}
                    deckTextureUrl={deckTextureUrl}
                    truckColor={truckColor}
                    boltColor={boltColor}
                    pose="side"
                />
                <CameraControls
                    ref={cameraControls}
                    minDistance={0.2}
                    maxDistance={4}
                    onStart={onCameraControlStart}
                />
            </Suspense>

            <Preload all />
        </Canvas>
    );
}

function StageFloor() {
    const normalMap = useTexture('concrete-normal.avif');

    const configuredNormalMap = useMemo(() => {
        const texture = normalMap.clone();

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(30, 30);
        texture.anisotropy = 8;
        texture.needsUpdate = true;

        return texture;
    }, [normalMap]);

    const material = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                roughness: 0.75,
                color: ENVIRONMENT_COLOR,
                normalMap: configuredNormalMap,
            }),
        [configuredNormalMap],
    );

    return (
        <mesh
            material={material}
            castShadow
            receiveShadow
            position={[0, -0.005, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
        >
            <circleGeometry args={[20, 32]} />
        </mesh>
    );
}
