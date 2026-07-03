import { Billboard } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

type Props = {
    position: [number, number, number];
    isVisible: boolean;
    color?: string;
};

export function HotSpot({ position, isVisible, color = '#e6fc6a' }: Props) {
    const hotspotRef = useRef<THREE.Mesh>(null);

    return (
        <Billboard position={position} follow>
            <mesh ref={hotspotRef} visible={isVisible}>
                <circleGeometry args={[0.02, 32]} />
                <meshStandardMaterial color={color} transparent opacity={1} />
            </mesh>

            <mesh
                visible={isVisible}
                onPointerOver={() => {
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default';
                }}
            >
                <circleGeometry args={[0.03, 32]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </Billboard>
    );
}
