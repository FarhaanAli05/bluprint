"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

// Simple furniture pieces
function Bed({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2.2, 0.4, 3.5]} />
        <meshStandardMaterial color="#5B4B3A" roughness={0.7} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2, 0.3, 3.3]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.9} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-0.5, 0.85, -1.3]} castShadow>
        <boxGeometry args={[0.7, 0.2, 0.5]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.95} />
      </mesh>
      <mesh position={[0.5, 0.85, -1.3]} castShadow>
        <boxGeometry args={[0.7, 0.2, 0.5]} />
        <meshStandardMaterial color="#E8E8E8" roughness={0.95} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 1.3, -1.7]} castShadow>
        <boxGeometry args={[2.2, 1.4, 0.15]} />
        <meshStandardMaterial color="#4A3C2A" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Desktop */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[2.5, 0.08, 1.2]} />
        <meshStandardMaterial color="#8B7355" roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[
        [-1.1, 0.75, -0.5],
        [1.1, 0.75, -0.5],
        [-1.1, 0.75, 0.5],
        [1.1, 0.75, 0.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.08, 1.5, 0.08]} />
          <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 2.1, -0.3]} castShadow>
        <boxGeometry args={[1.2, 0.7, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 1.7, -0.3]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.1]} />
        <meshStandardMaterial color="#333333" metalness={0.7} />
      </mesh>
    </group>
  );
}

function Chair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.8} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 1.5, -0.4]} castShadow>
        <boxGeometry args={[0.85, 1.1, 0.1]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.8} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Wheels base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 5]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.1, 16]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Shade */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <coneGeometry args={[0.25, 0.35, 16, 1, true]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Light glow */}
      <pointLight position={[0, 1, 0]} intensity={0.5} color="#FFF5E6" distance={3} />
    </group>
  );
}

function Room() {
  const roomRef = useRef<THREE.Group>(null);

  // Slow continuous rotation
  useFrame((state) => {
    if (roomRef.current) {
      roomRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.3;
    }
  });

  return (
    <group ref={roomRef}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#D4C4A8" roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#E8E4DC" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#EAE6DE" roughness={0.9} />
      </mesh>

      {/* Furniture with floating animation */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.1}>
        <Bed position={[-1.5, 0, -2]} />
      </Float>

      <Float speed={2} rotationIntensity={0} floatIntensity={0.08}>
        <Desk position={[2, 0, -2.5]} />
      </Float>

      <Float speed={1.8} rotationIntensity={0} floatIntensity={0.12}>
        <Chair position={[2, 0, -1]} />
      </Float>

      <Float speed={2.5} rotationIntensity={0} floatIntensity={0.15}>
        <Lamp position={[0.5, 1.5, -3.5]} />
      </Float>
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#667eea" wireframe />
    </mesh>
  );
}

export default function Room3DVisualizer() {
  return (
    <div className="relative h-full w-full">
      {/* Gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-l from-transparent via-transparent to-[#0b0f1a]/50" />
      
      <Canvas
        shadows
        camera={{ position: [6, 4, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-3, 3, 2]} intensity={0.3} color="#667eea" />
          <pointLight position={[3, 3, -2]} intensity={0.2} color="#60a5fa" />

          {/* Room */}
          <Room />

          {/* Environment for reflections */}
          <Environment preset="apartment" />

          {/* Subtle orbit controls - disabled for auto rotation */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>

      {/* Glass overlay effect */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0b0f1a] to-transparent" />
    </div>
  );
}
