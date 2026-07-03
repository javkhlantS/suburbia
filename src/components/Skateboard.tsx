import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { GLTF } from 'three-stdlib';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

type SkateBoardProps = ThreeElements['group'] & {
    deckTextureUrl: string;
    deckTextureUrls: string[];
    wheelTextureUrls: string[];
    wheelTextureUrl: string;
    truckColor: string;
    boltColor: string;
    constantWheelSpin?: boolean;
    pose?: 'upright' | 'side';
};

type GLTFResult = GLTF & {
    nodes: {
        GripTape: THREE.Mesh;
        Wheel1: THREE.Mesh;
        Wheel2: THREE.Mesh;
        Deck: THREE.Mesh;
        Wheel4: THREE.Mesh;
        Bolts: THREE.Mesh;
        Wheel3: THREE.Mesh;
        Baseplates: THREE.Mesh;
        Truck1: THREE.Mesh;
        Truck2: THREE.Mesh;
    };
};

function repeatTexture(texture: THREE.Texture, repeat: number, anisotropy?: number) {
    const configuredTexture = texture.clone();

    configuredTexture.wrapS = THREE.RepeatWrapping;
    configuredTexture.wrapT = THREE.RepeatWrapping;
    configuredTexture.repeat.set(repeat, repeat);
    configuredTexture.needsUpdate = true;

    if (anisotropy) {
        configuredTexture.anisotropy = anisotropy;
    }

    return configuredTexture;
}

function configureColorTexture(texture: THREE.Texture) {
    const configuredTexture = texture.clone();

    configuredTexture.flipY = false;
    configuredTexture.colorSpace = THREE.SRGBColorSpace;
    configuredTexture.needsUpdate = true;

    return configuredTexture;
}

function selectedTextureIndex(urls: string[], selectedUrl: string) {
    const index = urls.findIndex((url) => url === selectedUrl);

    return index === -1 ? 0 : index;
}

export function Skateboard({
    boltColor,
    deckTextureUrl,
    deckTextureUrls,
    truckColor,
    wheelTextureUrl,
    wheelTextureUrls,
    constantWheelSpin = false,
    pose = 'upright',
    ...props
}: SkateBoardProps) {
    const wheel1Ref = useRef<THREE.Mesh>(null);
    const wheel2Ref = useRef<THREE.Mesh>(null);
    const wheel3Ref = useRef<THREE.Mesh>(null);
    const wheel4Ref = useRef<THREE.Mesh>(null);

    const { nodes } = useGLTF('/skateboard.gltf') as unknown as GLTFResult;

    const wheelTextureMaps = useTexture(wheelTextureUrls);
    const wheelTextureIndex = selectedTextureIndex(wheelTextureUrls, wheelTextureUrl);

    const deckTextureMaps = useTexture(deckTextureUrls);
    const deckTextureIndex = selectedTextureIndex(deckTextureUrls, deckTextureUrl);

    const gripTapeDiffuseMap = useTexture('/skateboard/griptape-diffuse.webp');
    const gripTapeRoughnessMap = useTexture('/skateboard/griptape-roughness.webp');
    const metalNormalMap = useTexture('/skateboard/metal-normal.avif');

    const gripTapeDiffuse = useMemo(
        () => repeatTexture(gripTapeDiffuseMap, 9),
        [gripTapeDiffuseMap],
    );
    const gripTapeRoughness = useMemo(
        () => repeatTexture(gripTapeRoughnessMap, 9, 8),
        [gripTapeRoughnessMap],
    );
    const metalNormal = useMemo(() => repeatTexture(metalNormalMap, 8, 8), [metalNormalMap]);
    const deckTexture = useMemo(
        () => configureColorTexture(deckTextureMaps[deckTextureIndex]),
        [deckTextureMaps, deckTextureIndex],
    );
    const wheelTexture = useMemo(
        () => configureColorTexture(wheelTextureMaps[wheelTextureIndex]),
        [wheelTextureMaps, wheelTextureIndex],
    );

    const gripTapeMaterial = useMemo(() => {
        const material = new THREE.MeshStandardMaterial({
            map: gripTapeDiffuse,
            bumpMap: gripTapeRoughness,
            roughnessMap: gripTapeRoughness,
            bumpScale: 3.5,
            roughness: 0.8,
            color: '#555555',
        });

        return material;
    }, [gripTapeDiffuse, gripTapeRoughness]);

    const boltMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: boltColor,
                metalness: 0.5,
                roughness: 0.3,
            }),
        [boltColor],
    );

    const truckMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: truckColor,
                metalness: 0.8,
                roughness: 0.25,
                normalMap: metalNormal,
                normalScale: new THREE.Vector2(0.3, 0.3),
            }),
        [metalNormal, truckColor],
    );

    const deckMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                roughness: 0.1,
                map: deckTexture,
            }),
        [deckTexture],
    );

    const wheelMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                roughness: 0.1,
                map: wheelTexture,
            }),
        [wheelTexture],
    );

    const wheelSpinSpeed = Math.PI * 4;
    const fullRotation = Math.PI * 2;

    useFrame((_, delta) => {
        if (!constantWheelSpin) return;

        for (const wheel of [
            wheel1Ref.current,
            wheel2Ref.current,
            wheel3Ref.current,
            wheel4Ref.current,
        ]) {
            if (wheel) {
                wheel.rotation.x = (wheel.rotation.x - delta * wheelSpinSpeed) % fullRotation;
            }
        }
    });

    useEffect(() => {
        if (constantWheelSpin) return;

        for (const wheel of [
            wheel1Ref.current,
            wheel2Ref.current,
            wheel3Ref.current,
            wheel4Ref.current,
        ]) {
            if (wheel) {
                gsap.to(wheel.rotation, {
                    x: '-=30',
                    duration: 2.5,
                    ease: 'circ.out',
                });
            }
        }
    }, [constantWheelSpin, wheelTextureUrl]);

    const positions = useMemo(
        () =>
            ({
                upright: {
                    rotation: [0, 0, 0],
                    position: [0, 0, 0],
                },
                side: {
                    rotation: [0, 0, Math.PI / 2],
                    position: [0, 0.295, 0],
                },
            }) as const,
        [],
    );

    return (
        <group
            {...props}
            dispose={null}
            rotation={positions[pose].rotation}
            position={positions[pose].position}
        >
            <group name="Scene">
                <mesh
                    name="GripTape"
                    castShadow
                    receiveShadow
                    geometry={nodes.GripTape.geometry}
                    material={gripTapeMaterial}
                    position={[0, 0.286, -0.002]}
                />
                <mesh
                    name="Wheel1"
                    castShadow
                    receiveShadow
                    geometry={nodes.Wheel1.geometry}
                    material={wheelMaterial}
                    position={[0.238, 0.086, 0.635]}
                    ref={wheel1Ref}
                />
                <mesh
                    name="Wheel2"
                    castShadow
                    receiveShadow
                    geometry={nodes.Wheel2.geometry}
                    material={wheelMaterial}
                    position={[-0.237, 0.086, 0.635]}
                    ref={wheel2Ref}
                />
                <mesh
                    name="Deck"
                    castShadow
                    receiveShadow
                    geometry={nodes.Deck.geometry}
                    material={deckMaterial}
                    position={[0, 0.271, -0.002]}
                />
                <mesh
                    name="Wheel4"
                    castShadow
                    receiveShadow
                    geometry={nodes.Wheel4.geometry}
                    material={wheelMaterial}
                    position={[-0.238, 0.086, -0.635]}
                    rotation={[Math.PI, 0, Math.PI]}
                    ref={wheel4Ref}
                />
                <mesh
                    name="Bolts"
                    castShadow
                    receiveShadow
                    geometry={nodes.Bolts.geometry}
                    material={boltMaterial}
                    position={[0, 0.198, 0]}
                    rotation={[Math.PI, 0, Math.PI]}
                />
                <mesh
                    name="Wheel3"
                    castShadow
                    receiveShadow
                    geometry={nodes.Wheel3.geometry}
                    material={wheelMaterial}
                    position={[0.237, 0.086, -0.635]}
                    rotation={[Math.PI, 0, Math.PI]}
                    ref={wheel3Ref}
                />
                <mesh
                    name="Baseplates"
                    castShadow
                    receiveShadow
                    geometry={nodes.Baseplates.geometry}
                    material={truckMaterial}
                    position={[0, 0.211, 0]}
                />
                <mesh
                    name="Truck1"
                    castShadow
                    receiveShadow
                    geometry={nodes.Truck1.geometry}
                    material={truckMaterial}
                    position={[0, 0.101, -0.617]}
                />
                <mesh
                    name="Truck2"
                    castShadow
                    receiveShadow
                    geometry={nodes.Truck2.geometry}
                    material={truckMaterial}
                    position={[0, 0.101, 0.617]}
                    rotation={[Math.PI, 0, Math.PI]}
                />
            </group>
        </group>
    );
}

useGLTF.preload('/skateboard.gltf');
