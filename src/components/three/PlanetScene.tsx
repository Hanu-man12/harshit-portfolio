'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function Planet() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/images/hero/planet-texture.jpg');

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.8, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function Ring() {
  return (
    <mesh rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[2.6, 0.08, 16, 100]} />
      <meshStandardMaterial color="#e63946" transparent opacity={0.5} wireframe />
    </mesh>
  );
}

export default function PlanetScene() {
  return (
    <Canvas
      style={{background: 'transparent', width: '100%', height: '100%'}}
      gl={{alpha: true}}
      camera={{position: [0, 0, 5], fov: 50}}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#e63946" />
      <pointLight position={[-5, -3, -5]} intensity={0.5} />
      <Planet />
      <Ring />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}
