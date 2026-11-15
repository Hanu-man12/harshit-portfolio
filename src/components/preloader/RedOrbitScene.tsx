'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function seededValue(index: number, offset: number) {
  const value = Math.sin(index * 127.1 + offset * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function StarField({ mobile }: { mobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = mobile ? 90 : 190;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      values[i * 3] = (seededValue(i, 1) - 0.5) * 17;
      values[i * 3 + 1] = (seededValue(i, 2) - 0.5) * 10;
      values[i * 3 + 2] = -1.5 - seededValue(i, 3) * 7;
    }
    return values;
  }, [mobile]);

  useFrame((_, delta) => {
    if (document.visibilityState !== 'visible') return;
    if (ref.current) ref.current.rotation.z += delta * 0.002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d8d7e3" size={0.018} transparent opacity={0.78} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function RedParticles({ mobile }: { mobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = mobile ? 8 : 16;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      values[i * 3] = (seededValue(i, 8) - 0.5) * 12;
      values[i * 3 + 1] = (seededValue(i, 9) - 0.5) * 7;
      values[i * 3 + 2] = -0.7 - seededValue(i, 10) * 3;
    }
    return values;
  }, [mobile]);

  useFrame((_, delta) => {
    if (document.visibilityState !== 'visible') return;
    if (ref.current) ref.current.rotation.y += delta * 0.006;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ff243f" size={0.035} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Planet({ texture, mobile }: { texture: THREE.Texture | null; mobile: boolean }) {
  const planetRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (document.visibilityState !== 'visible') return;
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.055;
  });

  return (
    <group ref={planetRef} position={mobile ? [0, 0.42, 0] : [1.28, 0.02, 0]} scale={mobile ? 0.5 : 1}>
      <mesh>
        <sphereGeometry args={[1.42, 72, 72]} />
        <meshStandardMaterial map={texture ?? undefined} color={texture ? '#ffffff' : '#a23a32'} roughness={0.96} metalness={0.02} />
      </mesh>
    </group>
  );
}

export default function RedOrbitScene({ texture, mobile, onReady }: { texture: THREE.Texture | null; mobile: boolean; onReady: () => void }) {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 6.6], fov: 40 }}
      dpr={mobile ? 1 : [1, 1.45]}
      gl={{ alpha: true, antialias: !mobile, powerPreference: 'low-power' }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        onReady();
      }}
    >
      <ambientLight intensity={0.34} color="#bac2dc" />
      <directionalLight position={[-4, 2.5, 4]} intensity={2.45} color="#ffe1d4" />
      <pointLight position={[2.8, -1.2, -2]} intensity={1.1} distance={7} color="#a90e2e" />
      <StarField mobile={mobile} />
      <RedParticles mobile={mobile} />
      <Planet texture={texture} mobile={mobile} />
    </Canvas>
  );
}
