'use client';

import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ContactShadows, Environment, Html } from '@react-three/drei';
import { Skateboard } from '@/components/Skateboard';
import * as THREE from 'three';
import gsap from 'gsap';
import { HotSpot } from './HotSpot';
import { WavyPaths } from './WavyPaths';

const INITIAL_CAMERA_POSISTION = [1.5, 1, 1.4] as const;

type Props = {
    deckTextureUrl: string;
    wheelTextureUrl: string;
    truckColor: string;
    boltColor: string;
};

export function InteractiveSkateboard({
    deckTextureUrl,
    wheelTextureUrl,
    truckColor,
    boltColor,
}: Props) {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Canvas
                className="min-h-[60rem] w-full"
                camera={{ position: INITIAL_CAMERA_POSISTION, fov: 55 }}
            >
                <Suspense>
                    <Scene
                        deckTextureUrl={deckTextureUrl}
                        wheelTextureUrl={wheelTextureUrl}
                        truckColor={truckColor}
                        boltColor={boltColor}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}

function Scene({ deckTextureUrl, wheelTextureUrl, truckColor, boltColor }: Props) {
    const containerRef = useRef<THREE.Group>(null);
    const originRef = useRef<THREE.Group>(null);

    const [animating, setAnimating] = useState(false);
    const [showHotspot, setShowHotspot] = useState({
        front: true,
        middle: true,
        back: true,
    });

    const { camera } = useThree();

    useEffect(() => {
        if (!containerRef.current || !originRef.current) return;

        gsap.to(containerRef.current.position, {
            x: 0.2,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        });

        gsap.to(originRef.current.position, {
            y: Math.PI / 64,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        });
    }, []);

    useEffect(() => {
        camera.lookAt(new THREE.Vector3(-0.2, 0.15, 0));

        setZoom();

        window.addEventListener('resize', setZoom);

        function setZoom() {
            const scale = Math.max(Math.min(1000 / window.innerWidth, 2.2), 1);

            camera.position.x = INITIAL_CAMERA_POSISTION[0] * scale;
            camera.position.y = INITIAL_CAMERA_POSISTION[1] * scale;
            camera.position.z = INITIAL_CAMERA_POSISTION[2] * scale;
        }

        return () => {
            window.removeEventListener('resize', setZoom);
        };
    }, [camera]);

    function onClick(event: ThreeEvent<MouseEvent>) {
        event.stopPropagation();

        const board = containerRef.current;
        const origin = originRef.current;

        if (!board || !origin || animating) return;

        const { name } = event.object;

        setShowHotspot((current) => ({ ...current, [name]: false }));

        if (name === 'back') {
            ollie(board);
        } else if (name === 'middle') {
            kickFlip(board);
        } else if (name === 'front') {
            frontSide360(board, origin);
        }
    }

    function ollie(board: THREE.Group) {
        jumpBoard(board);

        gsap.timeline()
            .to(board.rotation, {
                x: -0.6,
                duration: 0.26,
                ease: 'none',
            })
            .to(board.rotation, {
                x: 0.4,
                duration: 0.82,
                ease: 'power2.in',
            })
            .to(board.rotation, {
                x: 0,
                duration: 0.12,
                ease: 'none',
            });
    }

    function kickFlip(board: THREE.Group) {
        jumpBoard(board);

        gsap.timeline()
            .to(board.rotation, {
                x: -0.6,
                duration: 0.26,
                ease: 'none',
            })
            .to(board.rotation, {
                x: 0.4,
                duration: 0.82,
                ease: 'power2.in',
            })
            .to(
                board.rotation,
                {
                    z: `+=${Math.PI * 2}`,
                    duration: 0.75,
                    ease: 'none',
                },
                0.3,
            )
            .to(board.rotation, {
                x: 0,
                duration: 0.12,
                ease: 'none',
            });
    }

    function frontSide360(board: THREE.Group, origin: THREE.Group) {
        jumpBoard(board);

        gsap.timeline()
            .to(board.rotation, {
                x: -0.6,
                duration: 0.26,
                ease: 'none',
            })
            .to(board.rotation, {
                x: 0.4,
                duration: 0.82,
                ease: 'power2.in',
            })
            .to(
                origin.rotation,
                {
                    y: `+=${Math.PI * 2}`,
                    duration: 0.77,
                    ease: 'none',
                },
                0.3,
            )
            .to(board.rotation, {
                x: 0,
                duration: 0.14,
                ease: 'none',
            });
    }

    function jumpBoard(board: THREE.Group) {
        setAnimating(true);

        gsap.timeline({ onComplete: () => setAnimating(false) })
            .to(board.position, {
                y: 0.8,
                duration: 0.51,
                ease: 'power2.out',
                delay: 0.26,
            })
            .to(board.position, {
                y: 0,
                duration: 0.43,
                ease: 'power2.in',
            });
    }

    return (
        <group>
            <Environment files={'/hdr/warehouse-256.hdr'} />
            <group ref={originRef}>
                <group ref={containerRef} position={[-0.25, 0, -0.635]}>
                    <group position={[0, -0.086, 0.635]}>
                        <Skateboard
                            deckTextureUrls={[deckTextureUrl]}
                            deckTextureUrl={deckTextureUrl}
                            wheelTextureUrls={[wheelTextureUrl]}
                            wheelTextureUrl={wheelTextureUrl}
                            truckColor={truckColor}
                            boltColor={boltColor}
                            constantWheelSpin
                        />

                        <HotSpot
                            isVisible={!animating && showHotspot.front}
                            position={[0, 0.38, 1]}
                            color="#B8fc39"
                        />

                        <HotSpot
                            isVisible={!animating && showHotspot.middle}
                            position={[0, 0.33, 0]}
                            color="#ff7a51"
                        />

                        <HotSpot
                            isVisible={!animating && showHotspot.back}
                            position={[0, 0.35, -0.9]}
                            color="#46acfa"
                        />

                        <mesh position={[0, 0.27, 0.9]} name="front" onClick={onClick}>
                            <boxGeometry args={[0.6, 0.2, 0.58]} />
                            <meshStandardMaterial visible={false} />
                        </mesh>

                        <mesh position={[0, 0.27, 0]} name="middle" onClick={onClick}>
                            <boxGeometry args={[0.6, 0.1, 1.2]} />
                            <meshStandardMaterial visible={false} />
                        </mesh>

                        <mesh position={[0, 0.27, -0.9]} name="back" onClick={onClick}>
                            <boxGeometry args={[0.6, 0.2, 0.58]} />
                            <meshStandardMaterial visible={false} />
                        </mesh>
                    </group>
                </group>
            </group>
            <ContactShadows opacity={0.6} position={[0, -0.08, 0]} />

            <group
                rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                position={[0, -0.09, -0.5]}
                scale={[0.2, 0.2, 0.2]}
            >
                <Html
                    transform
                    zIndexRange={[1, 0]}
                    occlude="blending"
                    wrapperClass="pointer-events-none"
                >
                    <WavyPaths />
                </Html>
            </group>
        </group>
    );
}
