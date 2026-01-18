"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { SceneObject, ROOM } from "@/lib/dormRoomState";

// ============================================================
// MATERIALS
// ============================================================

function WoodMaterial({ color = "#8B7355", roughness = 0.6 }: { color?: string; roughness?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.1}
    />
  );
}

function FloorMaterial() {
  return (
    <meshStandardMaterial
      color="#C4A35A"
      roughness={0.4}
      metalness={0.1}
    />
  );
}

// ============================================================
// ROOM STRUCTURE WITH TRANSPARENT WALLS
// ============================================================

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth, 20, 20]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.35} metalness={0.05} />
      </mesh>

      {/* Floor planks for texture */}
      {Array.from({ length: Math.floor(ROOM.depth / 0.5) }).map((_, i) => (
        <mesh
          key={`plank-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, -ROOM.depth / 2 + i * 0.5 + 0.25]}
          receiveShadow
        >
          <planeGeometry args={[ROOM.width, 0.02]} />
          <meshStandardMaterial color="#1A1A1A" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function TransparentWalls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, ROOM.height / 2, -ROOM.depth / 2]} receiveShadow>
        <boxGeometry args={[ROOM.width, ROOM.height, 0.05]} />
        <meshStandardMaterial
          color="#1e3a8a"
          transparent
          opacity={0.15}
          roughness={0.2}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left wall */}
      <mesh position={[-ROOM.width / 2, ROOM.height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.05, ROOM.height, ROOM.depth]} />
        <meshStandardMaterial
          color="#1e3a8a"
          transparent
          opacity={0.15}
          roughness={0.2}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right wall */}
      <mesh position={[ROOM.width / 2, ROOM.height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.05, ROOM.height, ROOM.depth]} />
        <meshStandardMaterial
          color="#1e3a8a"
          transparent
          opacity={0.15}
          roughness={0.2}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Front wall (most transparent) */}
      <mesh position={[0, ROOM.height / 2, ROOM.depth / 2]} receiveShadow>
        <boxGeometry args={[ROOM.width, ROOM.height, 0.05]} />
        <meshStandardMaterial
          color="#1e3a8a"
          transparent
          opacity={0.05}
          roughness={0.2}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wall edges for visibility */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(ROOM.width, ROOM.height, ROOM.depth)]} />
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}

// ============================================================
// FURNITURE COMPONENTS (using props for positioning)
// ============================================================

function Bed({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const bedLength = 6.25;
  const bedWidth = 3.25;
  const bedHeight = 2;
  const frameHeight = 0.8;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, frameHeight / 2, 0]} castShadow>
        <boxGeometry args={[bedWidth, frameHeight, bedLength]} />
        <WoodMaterial color="#8B6914" roughness={0.5} />
      </mesh>

      <mesh position={[0, frameHeight + 1, -bedLength / 2 + 0.1]} castShadow>
        <boxGeometry args={[bedWidth, 2, 0.2]} />
        <WoodMaterial color="#8B6914" roughness={0.5} />
      </mesh>

      <mesh position={[0, frameHeight + 0.4, 0]} castShadow>
        <boxGeometry args={[bedWidth - 0.2, 0.6, bedLength - 0.4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>

      <mesh position={[0, frameHeight + 0.75, 0.3]} castShadow>
        <boxGeometry args={[bedWidth - 0.1, 0.3, bedLength - 1]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.9} />
      </mesh>
    </group>
  );
}

function DeskWithHutch({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const deskWidth = 4;
  const deskDepth = 2;
  const deskHeight = 2.5;
  const hutchHeight = 2.5;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, deskHeight, 0]} castShadow>
        <boxGeometry args={[deskWidth, 0.12, deskDepth]} />
        <WoodMaterial color="#9C7C4C" roughness={0.4} />
      </mesh>

      <mesh position={[-deskWidth / 2 + 0.08, deskHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.15, deskHeight, deskDepth]} />
        <WoodMaterial color="#9C7C4C" />
      </mesh>

      <group position={[deskWidth / 2 - 0.6, 0, 0]}>
        <mesh position={[0, deskHeight / 2, 0]} castShadow>
          <boxGeometry args={[1.1, deskHeight - 0.1, deskDepth - 0.1]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>
      </group>

      <group position={[0, deskHeight + 0.1, -deskDepth / 2 + 0.5]}>
        <mesh position={[0, hutchHeight / 2, -0.4]} castShadow>
          <boxGeometry args={[deskWidth - 0.2, hutchHeight, 0.1]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>

        {[0.8, 1.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[deskWidth - 0.4, 0.1, 0.8]} />
            <WoodMaterial color="#9C7C4C" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function OfficeChair({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group position={[0, 0.15, 0]}>
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <mesh key={i} rotation={[0, (angle * Math.PI) / 180, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.8]} />
            <meshStandardMaterial color="#1A1A1A" />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 1.2, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.7} />
      </mesh>

      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.2, 0.15, 1.2]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </mesh>

      <mesh position={[0, 2.5, -0.5]} castShadow rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.1, 1.4, 0.15]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Wardrobe({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const wardrobeWidth = 4;
  const wardrobeDepth = 2;
  const wardrobeHeight = 6;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, wardrobeHeight / 2, 0]} castShadow>
        <boxGeometry args={[wardrobeWidth, wardrobeHeight, wardrobeDepth]} />
        <WoodMaterial color="#A0784C" roughness={0.5} />
      </mesh>

      <mesh position={[-wardrobeWidth / 4, wardrobeHeight / 2, wardrobeDepth / 2 + 0.02]} castShadow>
        <boxGeometry args={[wardrobeWidth / 2 - 0.05, wardrobeHeight - 0.1, 0.08]} />
        <WoodMaterial color="#8B6914" roughness={0.4} />
      </mesh>

      <group position={[wardrobeWidth / 4, 0, wardrobeDepth / 2 + 0.02]}>
        {[1.5, 3, 4.5].map((y, i) => (
          <mesh key={i} position={[0, y, -0.4]} castShadow>
            <boxGeometry args={[wardrobeWidth / 2 - 0.15, 0.08, wardrobeDepth - 0.2]} />
            <WoodMaterial color="#9C7C4C" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Window() {
  return (
    <group position={[1.5, 4.5, -ROOM.depth / 2 + 0.16]}>
      <mesh>
        <boxGeometry args={[3, 3, 0.2]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[2.6, 2.6, 0.02]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// ============================================================
// SCENE COMPONENT
// ============================================================

interface SceneProps {
  sceneObjects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function Scene({ sceneObjects, selectedId, onSelect }: SceneProps) {
  const controlsRef = useRef<any>(null);

  const renderFurniture = (obj: SceneObject) => {
    const isSelected = selectedId === obj.id;

    const groupProps = {
      onClick: (e: any) => {
        e.stopPropagation();
        onSelect(obj.id);
      },
    };

    switch (obj.type) {
      case 'bed':
        return <group key={obj.id} {...groupProps}><Bed position={obj.position} rotation={obj.rotation} /></group>;
      case 'desk':
        return <group key={obj.id} {...groupProps}><DeskWithHutch position={obj.position} rotation={obj.rotation} /></group>;
      case 'chair':
        return <group key={obj.id} {...groupProps}><OfficeChair position={obj.position} rotation={obj.rotation} /></group>;
      case 'shelf':
        return <group key={obj.id} {...groupProps}><Wardrobe position={obj.position} rotation={obj.rotation} /></group>;
      default:
        return null;
    }
  };

  return (
    <>
      <color attach="background" args={["#0a1128"]} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <directionalLight
        position={[2, 5, -8]}
        intensity={0.4}
        color="#87CEEB"
      />

      <Floor />
      <TransparentWalls />
      <Window />

      {sceneObjects.map(renderFurniture)}

      <Grid
        position={[0, 0.01, 0]}
        args={[ROOM.width * 2, ROOM.depth * 2]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e3a8a"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3b82f6"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={0.2}
        target={[0, 3, 0]}
        makeDefault
      />
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </div>
      <p className="mt-4 text-sm text-slate-400">Loading 3D Room...</p>
    </div>
  );
}

interface EnhancedDormViewerProps {
  sceneObjects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function EnhancedDormViewer({ sceneObjects, selectedId, onSelect }: EnhancedDormViewerProps) {
  return (
    <div className="relative h-full w-full min-h-[500px] bg-[#0a1128] rounded-xl overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows
          camera={{
            position: [12, 8, 12],
            fov: 65,
            near: 0.2,
            far: 50,
          }}
          gl={{ antialias: true }}
          onPointerMissed={() => onSelect(null)}
        >
          <Scene sceneObjects={sceneObjects} selectedId={selectedId} onSelect={onSelect} />
        </Canvas>
      </Suspense>
    </div>
  );
}
