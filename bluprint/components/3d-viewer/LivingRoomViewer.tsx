"use client";

import { useRef, useState, Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SceneObject, LIVING_ROOM, COLORS } from "@/lib/livingRoomState";

// ============================================================
// ROOM CONSTANTS (based on provided photos)
// ============================================================

const DIMENSIONS = {
  width: LIVING_ROOM.width,
  depth: LIVING_ROOM.depth,
  height: LIVING_ROOM.height,
  wallThickness: LIVING_ROOM.wallThickness,
};

// ============================================================
// MATERIALS
// ============================================================

function StoneMaterial({ variant = 'primary' }: { variant?: 'primary' | 'mixed' | 'dark' }) {
  const colors = {
    primary: COLORS.stoneFireplace,
    mixed: COLORS.stoneMixed,
    dark: '#5A5A5A',
  };
  
  return (
    <meshStandardMaterial
      color={colors[variant]}
      roughness={0.95}
      metalness={0.02}
    />
  );
}

// ============================================================
// FLOOR - Diagonal Tile Pattern
// ============================================================

function TileFloor() {
  const tileSize = 1.5;
  const tilesX = Math.ceil(DIMENSIONS.width / tileSize);
  const tilesZ = Math.ceil(DIMENSIONS.depth / tileSize);

  return (
    <group>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[DIMENSIONS.width, DIMENSIONS.depth]} />
        <meshStandardMaterial color={COLORS.floorTile} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Tile grout lines - diagonal pattern */}
      {Array.from({ length: tilesX + tilesZ }).map((_, i) => (
        <mesh
          key={`grout-d1-${i}`}
          rotation={[-Math.PI / 2, Math.PI / 4, 0]}
          position={[
            -DIMENSIONS.width / 2 + i * tileSize * 0.707,
            0.002,
            -DIMENSIONS.depth / 2 + i * tileSize * 0.707
          ]}
          receiveShadow
        >
          <planeGeometry args={[DIMENSIONS.width * 2, 0.03]} />
          <meshStandardMaterial color="#A09080" transparent opacity={0.5} />
        </mesh>
      ))}
      
      {/* Cross grout lines */}
      {Array.from({ length: tilesX + tilesZ }).map((_, i) => (
        <mesh
          key={`grout-d2-${i}`}
          rotation={[-Math.PI / 2, -Math.PI / 4, 0]}
          position={[
            -DIMENSIONS.width / 2 + i * tileSize * 0.707,
            0.002,
            DIMENSIONS.depth / 2 - i * tileSize * 0.707
          ]}
          receiveShadow
        >
          <planeGeometry args={[DIMENSIONS.width * 2, 0.03]} />
          <meshStandardMaterial color="#A09080" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// WALLS WITH ADAPTIVE TRANSPARENCY
// ============================================================

function AdaptiveWalls() {
  const { camera } = useThree();
  const [opacities, setOpacities] = useState({ front: 1, back: 1, left: 1, right: 1, ceiling: 1 });

  const wallRefs = {
    front: useRef<THREE.Mesh>(null),
    back: useRef<THREE.Mesh>(null),
    left: useRef<THREE.Mesh>(null),
    right: useRef<THREE.Mesh>(null),
  };

  useFrame(() => {
    if (!camera) return;

    const roomCenter = new THREE.Vector3(0, DIMENSIONS.height / 2, 0);
    const cameraPos = camera.position;

    const dx = cameraPos.x - roomCenter.x;
    const dy = cameraPos.y - roomCenter.y;
    const dz = cameraPos.z - roomCenter.z;

    let targetOpacities = { front: 1, back: 1, left: 1, right: 1, ceiling: 1 };
    const CORNER_THRESHOLD = 0.65;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) {
      if (dy > 0) {
        targetOpacities.ceiling = 0.12;
        const secondaryHorizontal = Math.max(Math.abs(dx), Math.abs(dz));
        if (secondaryHorizontal / Math.abs(dy) > CORNER_THRESHOLD) {
          if (Math.abs(dx) > Math.abs(dz)) {
            targetOpacities[dx > 0 ? 'right' : 'left'] = 0.12;
          } else {
            targetOpacities[dz > 0 ? 'front' : 'back'] = 0.12;
          }
        }
      }
    } else if (Math.abs(dx) > Math.abs(dz)) {
      targetOpacities[dx > 0 ? 'right' : 'left'] = 0.12;
      if (Math.abs(dz) / Math.abs(dx) > CORNER_THRESHOLD) {
        targetOpacities[dz > 0 ? 'front' : 'back'] = 0.12;
      }
    } else {
      targetOpacities[dz > 0 ? 'front' : 'back'] = 0.12;
      if (Math.abs(dx) / Math.abs(dz) > CORNER_THRESHOLD) {
        targetOpacities[dx > 0 ? 'right' : 'left'] = 0.12;
      }
    }

    const newOpacities = {
      front: THREE.MathUtils.lerp(opacities.front, targetOpacities.front, 0.08),
      back: THREE.MathUtils.lerp(opacities.back, targetOpacities.back, 0.08),
      left: THREE.MathUtils.lerp(opacities.left, targetOpacities.left, 0.08),
      right: THREE.MathUtils.lerp(opacities.right, targetOpacities.right, 0.08),
      ceiling: THREE.MathUtils.lerp(opacities.ceiling, targetOpacities.ceiling, 0.08),
    };

    setOpacities(newOpacities);

    Object.entries(wallRefs).forEach(([key, ref]) => {
      if (ref.current) {
        const mat = ref.current.material as THREE.MeshStandardMaterial;
        mat.opacity = newOpacities[key as keyof typeof newOpacities];
        mat.depthWrite = newOpacities[key as keyof typeof newOpacities] > 0.5;
      }
    });
  });

  const wallMaterial = (opacity: number) => (
    <meshStandardMaterial
      color={COLORS.wallPaint}
      transparent
      opacity={opacity}
      roughness={0.9}
      side={THREE.DoubleSide}
      depthWrite={opacity > 0.5}
    />
  );

  return (
    <>
      <group>
        {/* Back wall */}
        <mesh ref={wallRefs.back} position={[0, DIMENSIONS.height / 2, -DIMENSIONS.depth / 2]} receiveShadow renderOrder={10}>
          <boxGeometry args={[DIMENSIONS.width, DIMENSIONS.height, DIMENSIONS.wallThickness]} />
          {wallMaterial(opacities.back)}
        </mesh>

        {/* Front wall (with door) */}
        <mesh ref={wallRefs.front} position={[0, DIMENSIONS.height / 2, DIMENSIONS.depth / 2]} receiveShadow renderOrder={10}>
          <boxGeometry args={[DIMENSIONS.width, DIMENSIONS.height, DIMENSIONS.wallThickness]} />
          {wallMaterial(opacities.front)}
        </mesh>

        {/* Left wall (with fireplace) */}
        <mesh ref={wallRefs.left} position={[-DIMENSIONS.width / 2, DIMENSIONS.height / 2, 0]} receiveShadow renderOrder={10}>
          <boxGeometry args={[DIMENSIONS.wallThickness, DIMENSIONS.height, DIMENSIONS.depth]} />
          {wallMaterial(opacities.left)}
        </mesh>

        {/* Right wall (with staircase) */}
        <mesh ref={wallRefs.right} position={[DIMENSIONS.width / 2, DIMENSIONS.height / 2, 0]} receiveShadow renderOrder={10}>
          <boxGeometry args={[DIMENSIONS.wallThickness, DIMENSIONS.height, DIMENSIONS.depth]} />
          {wallMaterial(opacities.right)}
        </mesh>
      </group>

      {/* Ceiling */}
      <mesh position={[0, DIMENSIONS.height, 0]} receiveShadow renderOrder={11}>
        <boxGeometry args={[DIMENSIONS.width, 0.15, DIMENSIONS.depth]} />
        <meshStandardMaterial
          color={COLORS.ceiling}
          transparent
          opacity={opacities.ceiling}
          roughness={0.9}
          side={THREE.FrontSide}
          depthWrite={opacities.ceiling > 0.5}
        />
      </mesh>
    </>
  );
}

// ============================================================
// BASEBOARDS (White Trim)
// ============================================================

function Baseboards() {
  const baseY = 0.2;
  const thickness = 0.08;

  return (
    <group>
      {/* Back wall baseboard */}
      <mesh position={[0, baseY, -DIMENSIONS.depth / 2 + thickness / 2 + 0.01]}>
        <boxGeometry args={[DIMENSIONS.width, 0.4, thickness]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.6} />
      </mesh>

      {/* Front wall baseboard */}
      <mesh position={[0, baseY, DIMENSIONS.depth / 2 - thickness / 2 - 0.01]}>
        <boxGeometry args={[DIMENSIONS.width, 0.4, thickness]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.6} />
      </mesh>

      {/* Left wall baseboard */}
      <mesh position={[-DIMENSIONS.width / 2 + thickness / 2 + 0.01, baseY, 0]}>
        <boxGeometry args={[thickness, 0.4, DIMENSIONS.depth]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.6} />
      </mesh>

      {/* Right wall baseboard */}
      <mesh position={[DIMENSIONS.width / 2 - thickness / 2 - 0.01, baseY, 0]}>
        <boxGeometry args={[thickness, 0.4, DIMENSIONS.depth]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ============================================================
// STONE FIREPLACE (Main Feature)
// ============================================================

function StoneFireplace() {
  const fireplaceWidth = 6;
  const fireplaceHeight = 4;
  const stoneDepth = 0.8;
  
  return (
    <group position={[-DIMENSIONS.width / 2 + stoneDepth / 2 + 0.1, 0, -1]}>
      {/* Stone surround base */}
      <mesh position={[0, fireplaceHeight / 2, 0]} castShadow>
        <boxGeometry args={[stoneDepth, fireplaceHeight, fireplaceWidth]} />
        <StoneMaterial variant="primary" />
      </mesh>

      {/* Stone texture variation blocks */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`stone-${i}`}
          position={[
            stoneDepth / 2 + 0.01,
            0.5 + (i % 5) * 0.7 + Math.random() * 0.2,
            -2.5 + Math.floor(i / 5) * 1.2 + Math.random() * 0.3
          ]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.4 + Math.random() * 0.3, 0.6 + Math.random() * 0.4]} />
          <StoneMaterial variant={Math.random() > 0.5 ? 'mixed' : 'primary'} />
        </mesh>
      ))}

      {/* Fireplace opening (black interior) */}
      <mesh position={[stoneDepth / 2 + 0.05, 1.2, 0]}>
        <boxGeometry args={[0.1, 2, 3]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>

      {/* Black metal insert */}
      <mesh position={[stoneDepth / 2 + 0.15, 1.2, 0]} castShadow>
        <boxGeometry args={[0.1, 1.8, 2.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Insert frame */}
      <mesh position={[stoneDepth / 2 + 0.2, 1.2, 0]}>
        <boxGeometry args={[0.05, 2, 3]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* White mantel shelf */}
      <mesh position={[stoneDepth / 2 + 0.25, 2.8, 0]} castShadow>
        <boxGeometry args={[0.3, 0.15, fireplaceWidth + 0.5]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.4} />
      </mesh>

      {/* Mantel support brackets */}
      {[-2, 2].map((z, i) => (
        <mesh key={`bracket-${i}`} position={[stoneDepth / 2 + 0.15, 2.65, z]}>
          <boxGeometry args={[0.15, 0.25, 0.15]} />
          <meshStandardMaterial color={COLORS.trim} roughness={0.4} />
        </mesh>
      ))}

      {/* Gray accent wall above fireplace */}
      <mesh position={[0, fireplaceHeight + 2, 0]} castShadow>
        <boxGeometry args={[stoneDepth - 0.1, 4, fireplaceWidth]} />
        <meshStandardMaterial color={COLORS.accentWall} roughness={0.85} />
      </mesh>

      {/* Stone hearth (raised platform at bottom) */}
      <mesh position={[stoneDepth / 2 + 0.3, 0.15, 0]} castShadow>
        <boxGeometry args={[0.6, 0.3, fireplaceWidth + 1]} />
        <StoneMaterial variant="dark" />
      </mesh>
    </group>
  );
}

// ============================================================
// STONE ALCOVE (Adjacent to fireplace)
// ============================================================

function StoneAlcove() {
  return (
    <group position={[-DIMENSIONS.width / 2 + 0.5, 0, -5]}>
      {/* Stone column/alcove */}
      <mesh position={[0, DIMENSIONS.height / 2, 0]} castShadow>
        <boxGeometry args={[0.8, DIMENSIONS.height, 1.5]} />
        <StoneMaterial variant="primary" />
      </mesh>

      {/* Stone texture blocks */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`alcove-stone-${i}`}
          position={[
            0.45,
            0.8 + (i % 6) * 1.2,
            -0.5 + Math.floor(i / 6) * 0.8
          ]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.5 + Math.random() * 0.4, 0.4 + Math.random() * 0.3]} />
          <StoneMaterial variant={Math.random() > 0.5 ? 'mixed' : 'dark'} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// WINDOWS
// ============================================================

function FrontWindow() {
  // Large window with stone surround (near door)
  return (
    <group position={[-3, 3, DIMENSIONS.depth / 2 - 0.3]}>
      {/* Stone surround */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[5, 5.5, 0.5]} />
        <StoneMaterial variant="primary" />
      </mesh>

      {/* Window opening */}
      <mesh position={[0, 0.3, 0.2]}>
        <boxGeometry args={[4, 4.5, 0.1]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.35}
          metalness={0.7}
          roughness={0.1}
        />
      </mesh>

      {/* Window frame (white) */}
      <mesh position={[0, 0.3, 0.25]}>
        <boxGeometry args={[4.2, 4.7, 0.05]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.5} />
      </mesh>

      {/* Window panes dividers */}
      <mesh position={[0, 0.3, 0.3]}>
        <boxGeometry args={[0.08, 4.5, 0.05]} />
        <meshStandardMaterial color={COLORS.trim} />
      </mesh>
      <mesh position={[0, 0.3, 0.3]}>
        <boxGeometry args={[4, 0.08, 0.05]} />
        <meshStandardMaterial color={COLORS.trim} />
      </mesh>

      {/* Decorative niche below window */}
      <mesh position={[0, -2.2, 0.15]}>
        <boxGeometry args={[1, 0.8, 0.3]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      {/* Decorative lamp in niche */}
      <group position={[0, -2, 0.35]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.5, 8]} />
          <meshStandardMaterial 
            color="#FFA500" 
            emissive="#FF8C00" 
            emissiveIntensity={0.6}
            transparent
            opacity={0.9}
          />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={0.4} distance={3} color="#FFA500" />
      </group>
    </group>
  );
}

function SideWindow() {
  // Standard window on left wall
  return (
    <group position={[-DIMENSIONS.width / 2 + 0.2, 4, 4]}>
      {/* Window frame */}
      <mesh castShadow>
        <boxGeometry args={[0.25, 4, 3]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.5} />
      </mesh>

      {/* Glass */}
      <mesh position={[0.05, 0, 0]}>
        <boxGeometry args={[0.05, 3.5, 2.5]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.35}
          metalness={0.7}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// ============================================================
// ENTRY DOOR (Burgundy)
// ============================================================

function EntryDoor() {
  return (
    <group position={[3, 0, DIMENSIONS.depth / 2 - 0.2]}>
      {/* Door frame (white) */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[3.5, 7.2, 0.3]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.5} />
      </mesh>

      {/* Burgundy door */}
      <mesh position={[0, 3.5, 0.1]} castShadow>
        <boxGeometry args={[3, 7, 0.15]} />
        <meshStandardMaterial color={COLORS.doorColor} roughness={0.6} />
      </mesh>

      {/* Door panels (6-panel design) */}
      {[1.5, 3.5, 5.5].map((y, row) => (
        [-0.6, 0.6].map((x, col) => (
          <mesh key={`panel-${row}-${col}`} position={[x, y, 0.18]} castShadow>
            <boxGeometry args={[1, 1.2, 0.05]} />
            <meshStandardMaterial color="#7a1515" roughness={0.5} />
          </mesh>
        ))
      ))}

      {/* Door handle */}
      <mesh position={[1.2, 3.5, 0.25]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color={COLORS.metalRailing} metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Transom window above door */}
      <mesh position={[0, 7.3, 0.1]}>
        <boxGeometry args={[3, 0.8, 0.1]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.4}
          metalness={0.6}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// ============================================================
// STAIRCASE WITH WROUGHT IRON RAILING
// ============================================================

function Staircase() {
  const numSteps = 14;
  const stepHeight = 0.55;
  const stepDepth = 0.85;
  const stairWidth = 3.5;

  return (
    <group position={[DIMENSIONS.width / 2 - 2, 0, 2]}>
      {/* Stair structure (white sides) */}
      <mesh position={[-stairWidth / 2 - 0.1, numSteps * stepHeight / 2, -numSteps * stepDepth / 2]} castShadow>
        <boxGeometry args={[0.2, numSteps * stepHeight + 1, numSteps * stepDepth + 1]} />
        <meshStandardMaterial color={COLORS.trim} roughness={0.6} />
      </mesh>

      {/* Individual steps */}
      {Array.from({ length: numSteps }).map((_, i) => (
        <group key={`step-${i}`} position={[0, i * stepHeight, -i * stepDepth]}>
          {/* Riser (vertical - white) */}
          <mesh position={[0, stepHeight / 2, stepDepth / 2]} castShadow>
            <boxGeometry args={[stairWidth, stepHeight, 0.1]} />
            <meshStandardMaterial color={COLORS.trim} roughness={0.6} />
          </mesh>

          {/* Tread (horizontal - red carpet) */}
          <mesh position={[0, stepHeight, 0]} castShadow>
            <boxGeometry args={[stairWidth, 0.12, stepDepth]} />
            <meshStandardMaterial color={COLORS.carpetStairs} roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Wrought iron railing */}
      <group position={[stairWidth / 2 - 0.1, 0, 0]}>
        {/* Vertical posts */}
        {Array.from({ length: Math.ceil(numSteps / 2) }).map((_, i) => {
          const stepIndex = i * 2;
          return (
            <mesh
              key={`post-${i}`}
              position={[0, stepIndex * stepHeight + 1.5, -stepIndex * stepDepth]}
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
              <meshStandardMaterial color={COLORS.metalRailing} metalness={0.8} roughness={0.3} />
            </mesh>
          );
        })}

        {/* Decorative scrollwork between posts */}
        {Array.from({ length: Math.ceil(numSteps / 2) - 1 }).map((_, i) => {
          const y1 = i * 2 * stepHeight + 1.5;
          const z1 = -i * 2 * stepDepth;
          
          return (
            <group key={`scroll-${i}`}>
              {/* Horizontal bars */}
              <mesh position={[0, y1 + stepHeight, z1 - stepDepth]} castShadow>
                <boxGeometry args={[0.03, 0.03, stepDepth * 2]} />
                <meshStandardMaterial color={COLORS.metalRailing} metalness={0.8} roughness={0.3} />
              </mesh>

              {/* Decorative S-curve (simplified as circles) */}
              <mesh position={[0, y1 + stepHeight * 0.5, z1 - stepDepth]}>
                <torusGeometry args={[0.15, 0.02, 8, 16, Math.PI]} />
                <meshStandardMaterial color={COLORS.metalRailing} metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          );
        })}

        {/* Handrail (wood) */}
        <mesh
          position={[0, numSteps * stepHeight / 2 + 2.8, -numSteps * stepDepth / 2]}
          rotation={[Math.atan(stepHeight / stepDepth), 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.08, numSteps * Math.sqrt(stepHeight ** 2 + stepDepth ** 2)]} />
          <meshStandardMaterial color={COLORS.woodHandrail} roughness={0.4} />
        </mesh>
      </group>

      {/* Under-stair storage opening */}
      <mesh position={[-stairWidth / 2 - 0.5, 2, 2]} castShadow>
        <boxGeometry args={[2, 4, 0.1]} />
        <meshStandardMaterial color={COLORS.wallPaint} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ============================================================
// RECESSED CEILING LIGHT
// ============================================================

function CeilingLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>
      <pointLight
        position={[0, -0.2, 0]}
        intensity={0.5}
        distance={10}
        decay={2}
        color="#FFF8E8"
        castShadow
      />
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
  showGrid: boolean;
  showBlueprint: boolean;
  showShadows: boolean;
  autoRotate: boolean;
}

function BlueprintGrid({ size = 50, divisions = 50 }: { size?: number; divisions?: number }) {
  return (
    <gridHelper
      args={[size, divisions, '#4A90E2', '#2A5080']}
      position={[0, 0.01, 0]}
    />
  );
}

function Scene({ sceneObjects, onSelect, showGrid, showBlueprint, showShadows, autoRotate }: SceneProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const initialCameraPos = useRef(new THREE.Vector3(14, 8, 14));
  const initialTarget = useRef(new THREE.Vector3(0, 3, 0));

  const performReset = () => {
    if (controlsRef.current && camera) {
      camera.position.copy(initialCameraPos.current);
      camera.updateProjectionMatrix();
      controlsRef.current.target.copy(initialTarget.current);
      controlsRef.current.update();
    }
  };

  useFrame(() => {
    if (autoRotate && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.8;
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });

  useEffect(() => {
    const handleReset = () => performReset();
    window.addEventListener('resetLivingRoomView', handleReset);
    return () => window.removeEventListener('resetLivingRoomView', handleReset);
  }, []);

  return (
    <>
      <color attach="background" args={[showBlueprint ? "#0a1128" : "#1a1a2e"]} />
      <fog attach="fog" args={[showBlueprint ? "#0a1128" : "#1a1a2e", 30, 60]} />

      {/* Ambient light */}
      <hemisphereLight args={["#ffffff", "#444444", 0.5]} />

      {/* Main directional light (sunlight from windows) */}
      <directionalLight
        position={[5, 10, 10]}
        intensity={1.2}
        color="#FFF8E8"
        castShadow={showShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />

      {/* Fill light */}
      <directionalLight
        position={[-8, 6, -5]}
        intensity={0.3}
        color="#E8F0FF"
      />

      {/* Grid overlay */}
      {showGrid && <BlueprintGrid size={30} divisions={30} />}

      {/* Room structure */}
      <TileFloor />
      <Baseboards />
      <AdaptiveWalls />

      {/* Key architectural features */}
      <StoneFireplace />
      <StoneAlcove />
      <FrontWindow />
      <SideWindow />
      <EntryDoor />
      <Staircase />

      {/* Ceiling lights */}
      <CeilingLight position={[0, DIMENSIONS.height - 0.1, 0]} />
      <CeilingLight position={[5, DIMENSIONS.height - 0.1, 3]} />
      <CeilingLight position={[-5, DIMENSIONS.height - 0.1, -3]} />

      {/* Blueprint mode overlay */}
      {showBlueprint && (
        <mesh position={[0, DIMENSIONS.height / 2, 0]}>
          <boxGeometry args={[DIMENSIONS.width, DIMENSIONS.height, DIMENSIONS.depth]} />
          <meshBasicMaterial color="#4A90E2" wireframe opacity={0.3} transparent />
        </mesh>
      )}

      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={35}
        maxPolarAngle={1.45}
        minPolarAngle={0.25}
        target={[0, 3, 0]}
        zoomSpeed={0.9}
        rotateSpeed={0.8}
        panSpeed={0.8}
        makeDefault
      />
    </>
  );
}

// ============================================================
// LOADING SCREEN
// ============================================================

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </div>
      <p className="mt-4 text-sm text-slate-400">Loading Living Room...</p>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface LivingRoomViewerProps {
  sceneObjects: SceneObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showGrid?: boolean;
  showBlueprint?: boolean;
  showShadows?: boolean;
  autoRotate?: boolean;
}

export default function LivingRoomViewer({
  sceneObjects,
  selectedId,
  onSelect,
  showGrid = false,
  showBlueprint = false,
  showShadows = true,
  autoRotate = false,
}: LivingRoomViewerProps) {
  const cameraConfig = useMemo(
    () => ({
      position: [14, 8, 14] as [number, number, number],
      fov: 65,
      near: 0.5,
      far: 80,
    }),
    []
  );

  return (
    <div
      className="relative h-full w-full min-h-[500px] bg-[#0a1128] rounded-xl overflow-hidden touch-none overscroll-contain"
      onWheelCapture={(event) => {
        event.preventDefault();
      }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows={showShadows}
          camera={cameraConfig}
          gl={{ antialias: true }}
          onPointerMissed={() => onSelect(null)}
        >
          <Scene
            sceneObjects={sceneObjects}
            selectedId={selectedId}
            onSelect={onSelect}
            showGrid={showGrid}
            showBlueprint={showBlueprint}
            showShadows={showShadows}
            autoRotate={autoRotate}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
