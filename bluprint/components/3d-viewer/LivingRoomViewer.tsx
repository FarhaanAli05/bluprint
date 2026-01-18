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
  const groutLines = useMemo(() => {
    const halfWidth = DIMENSIONS.width / 2;
    const halfDepth = DIMENSIONS.depth / 2;
    const bounds = {
      xmin: -halfWidth,
      xmax: halfWidth,
      zmin: -halfDepth,
      zmax: halfDepth,
    };
    const spacing = tileSize;
    const deltaC = spacing * Math.SQRT2;
    const lines: Array<{ center: [number, number, number]; length: number; angle: number }> = [];

    const collectLine = (m: 1 | -1, c: number) => {
      const points: Array<[number, number]> = [];

      const zAtXMin = m * bounds.xmin + c;
      if (zAtXMin >= bounds.zmin && zAtXMin <= bounds.zmax) {
        points.push([bounds.xmin, zAtXMin]);
      }
      const zAtXMax = m * bounds.xmax + c;
      if (zAtXMax >= bounds.zmin && zAtXMax <= bounds.zmax) {
        points.push([bounds.xmax, zAtXMax]);
      }

      const xAtZMin = (bounds.zmin - c) / m;
      if (xAtZMin >= bounds.xmin && xAtZMin <= bounds.xmax) {
        points.push([xAtZMin, bounds.zmin]);
      }
      const xAtZMax = (bounds.zmax - c) / m;
      if (xAtZMax >= bounds.xmin && xAtZMax <= bounds.xmax) {
        points.push([xAtZMax, bounds.zmax]);
      }

      const uniquePoints = points.filter(
        ([x, z], index) =>
          points.findIndex(([px, pz]) => Math.abs(px - x) < 0.0001 && Math.abs(pz - z) < 0.0001) === index
      );

      if (uniquePoints.length < 2) {
        return;
      }

      const [x1, z1] = uniquePoints[0];
      const [x2, z2] = uniquePoints[1];
      const length = Math.hypot(x2 - x1, z2 - z1);
      const angle = Math.atan2(z2 - z1, x2 - x1);
      lines.push({
        center: [(x1 + x2) / 2, 0.002, (z1 + z2) / 2],
        length,
        angle,
      });
    };

    const collectLinesForSlope = (m: 1 | -1) => {
      const cValues =
        m === 1
          ? [
              bounds.zmin - bounds.xmin,
              bounds.zmin - bounds.xmax,
              bounds.zmax - bounds.xmin,
              bounds.zmax - bounds.xmax,
            ]
          : [
              bounds.zmin + bounds.xmin,
              bounds.zmin + bounds.xmax,
              bounds.zmax + bounds.xmin,
              bounds.zmax + bounds.xmax,
            ];
      const minC = Math.min(...cValues);
      const maxC = Math.max(...cValues);

      for (let c = minC - deltaC; c <= maxC + deltaC; c += deltaC) {
        collectLine(m, c);
      }
    };

    collectLinesForSlope(1);
    collectLinesForSlope(-1);

    return lines;
  }, [tileSize]);

  return (
    <group>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[DIMENSIONS.width, DIMENSIONS.depth]} />
        <meshStandardMaterial color={COLORS.floorTile} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Tile grout lines - diagonal pattern (rendered as flat on floor) */}
      {groutLines.map((line, i) => (
        <mesh
          key={`grout-${i}`}
          rotation={[-Math.PI / 2, 0, line.angle]}
          position={line.center}
          receiveShadow
        >
          <planeGeometry args={[line.length, 0.03]} />
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

// Pre-computed static tile data to prevent re-randomization on render
const FIREPLACE_TILES = [
  { yOffset: 0.12, zOffset: 0.18, height: 0.52, width: 0.78, variant: 'mixed' as const },
  { yOffset: 0.08, zOffset: 0.24, height: 0.65, width: 0.92, variant: 'primary' as const },
  { yOffset: 0.15, zOffset: 0.11, height: 0.48, width: 0.68, variant: 'primary' as const },
  { yOffset: 0.05, zOffset: 0.28, height: 0.58, width: 0.85, variant: 'mixed' as const },
  { yOffset: 0.18, zOffset: 0.06, height: 0.42, width: 0.72, variant: 'primary' as const },
  { yOffset: 0.02, zOffset: 0.22, height: 0.61, width: 0.88, variant: 'mixed' as const },
  { yOffset: 0.14, zOffset: 0.15, height: 0.55, width: 0.76, variant: 'primary' as const },
  { yOffset: 0.09, zOffset: 0.19, height: 0.49, width: 0.82, variant: 'mixed' as const },
  { yOffset: 0.16, zOffset: 0.08, height: 0.63, width: 0.71, variant: 'primary' as const },
  { yOffset: 0.03, zOffset: 0.26, height: 0.44, width: 0.95, variant: 'mixed' as const },
  { yOffset: 0.11, zOffset: 0.13, height: 0.57, width: 0.69, variant: 'primary' as const },
  { yOffset: 0.07, zOffset: 0.21, height: 0.51, width: 0.84, variant: 'mixed' as const },
  { yOffset: 0.19, zOffset: 0.04, height: 0.46, width: 0.79, variant: 'primary' as const },
  { yOffset: 0.01, zOffset: 0.29, height: 0.59, width: 0.67, variant: 'mixed' as const },
  { yOffset: 0.13, zOffset: 0.17, height: 0.53, width: 0.91, variant: 'primary' as const },
  { yOffset: 0.06, zOffset: 0.23, height: 0.47, width: 0.74, variant: 'mixed' as const },
  { yOffset: 0.17, zOffset: 0.09, height: 0.64, width: 0.86, variant: 'primary' as const },
  { yOffset: 0.04, zOffset: 0.25, height: 0.41, width: 0.73, variant: 'mixed' as const },
  { yOffset: 0.10, zOffset: 0.14, height: 0.56, width: 0.89, variant: 'primary' as const },
  { yOffset: 0.08, zOffset: 0.20, height: 0.50, width: 0.77, variant: 'mixed' as const },
];

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

      {/* Stone texture variation blocks - using pre-computed static positions */}
      {FIREPLACE_TILES.map((tile, i) => (
        <mesh
          key={`stone-${i}`}
          position={[
            stoneDepth / 2 + 0.01,
            0.5 + (i % 5) * 0.7 + tile.yOffset,
            -2.5 + Math.floor(i / 5) * 1.2 + tile.zOffset
          ]}
          castShadow
        >
          <boxGeometry args={[0.1, tile.height, tile.width]} />
          <StoneMaterial variant={tile.variant} />
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

// Pre-computed static tile data for alcove to prevent re-randomization on render
const ALCOVE_TILES = [
  { height: 0.72, width: 0.58, variant: 'mixed' as const },
  { height: 0.65, width: 0.52, variant: 'dark' as const },
  { height: 0.81, width: 0.64, variant: 'mixed' as const },
  { height: 0.58, width: 0.48, variant: 'dark' as const },
  { height: 0.76, width: 0.55, variant: 'mixed' as const },
  { height: 0.69, width: 0.61, variant: 'dark' as const },
  { height: 0.84, width: 0.46, variant: 'mixed' as const },
  { height: 0.62, width: 0.67, variant: 'dark' as const },
  { height: 0.78, width: 0.53, variant: 'mixed' as const },
  { height: 0.55, width: 0.59, variant: 'dark' as const },
  { height: 0.71, width: 0.44, variant: 'mixed' as const },
  { height: 0.88, width: 0.56, variant: 'dark' as const },
];

function StoneAlcove() {
  return (
    <group position={[-DIMENSIONS.width / 2 + 0.5, 0, -5]}>
      {/* Stone column/alcove */}
      <mesh position={[0, DIMENSIONS.height / 2, 0]} castShadow>
        <boxGeometry args={[0.8, DIMENSIONS.height, 1.5]} />
        <StoneMaterial variant="primary" />
      </mesh>

      {/* Stone texture blocks - using pre-computed static values */}
      {ALCOVE_TILES.map((tile, i) => (
        <mesh
          key={`alcove-stone-${i}`}
          position={[
            0.45,
            0.8 + (i % 6) * 1.2,
            -0.5 + Math.floor(i / 6) * 0.8
          ]}
          castShadow
        >
          <boxGeometry args={[0.1, tile.height, tile.width]} />
          <StoneMaterial variant={tile.variant} />
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
      <mesh position={[1.2, 3.5, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
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

    </group>
  );
}

// ============================================================
// DINING TABLE
// ============================================================

function DiningTable({ position }: { position: [number, number, number] }) {
  const tableWidth = 4;
  const tableDepth = 2.2;
  const tableHeight = 2.5;
  const topThickness = 0.12;
  const legSize = 0.15;

  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, tableHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[tableWidth, topThickness, tableDepth]} />
        <meshStandardMaterial color="#5C4033" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Table legs */}
      {[
        [-tableWidth / 2 + legSize, tableHeight / 2, -tableDepth / 2 + legSize],
        [tableWidth / 2 - legSize, tableHeight / 2, -tableDepth / 2 + legSize],
        [-tableWidth / 2 + legSize, tableHeight / 2, tableDepth / 2 - legSize],
        [tableWidth / 2 - legSize, tableHeight / 2, tableDepth / 2 - legSize],
      ].map((pos, i) => (
        <mesh key={`leg-${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[legSize, tableHeight, legSize]} />
          <meshStandardMaterial color="#4A3728" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// DINING CHAIR
// ============================================================

function DiningChair({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const seatHeight = 1.5;
  const seatWidth = 1.2;
  const seatDepth = 1.2;
  const backHeight = 1.8;
  const legSize = 0.1;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, seatHeight, 0]} castShadow>
        <boxGeometry args={[seatWidth, 0.1, seatDepth]} />
        <meshStandardMaterial color="#8B4513" roughness={0.5} />
      </mesh>

      {/* Back */}
      <mesh position={[0, seatHeight + backHeight / 2, -seatDepth / 2 + 0.05]} castShadow>
        <boxGeometry args={[seatWidth, backHeight, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.5} />
      </mesh>

      {/* Back slats */}
      {[-0.35, 0, 0.35].map((x, i) => (
        <mesh key={`slat-${i}`} position={[x, seatHeight + backHeight / 2, -seatDepth / 2 + 0.08]} castShadow>
          <boxGeometry args={[0.15, backHeight - 0.3, 0.05]} />
          <meshStandardMaterial color="#6B4423" roughness={0.5} />
        </mesh>
      ))}

      {/* Legs */}
      {[
        [-seatWidth / 2 + legSize, seatHeight / 2, -seatDepth / 2 + legSize],
        [seatWidth / 2 - legSize, seatHeight / 2, -seatDepth / 2 + legSize],
        [-seatWidth / 2 + legSize, seatHeight / 2, seatDepth / 2 - legSize],
        [seatWidth / 2 - legSize, seatHeight / 2, seatDepth / 2 - legSize],
      ].map((pos, i) => (
        <mesh key={`chair-leg-${i}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[legSize, seatHeight, legSize]} />
          <meshStandardMaterial color="#5C4033" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// PLATE
// ============================================================

function Plate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Plate base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.38, 0.04, 24]} />
        <meshStandardMaterial color="#FAF9F6" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Plate rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[0.35, 0.02, 8, 24]} />
        <meshStandardMaterial color="#E8E6E3" roughness={0.3} />
      </mesh>
    </group>
  );
}

// ============================================================
// CAT TOWER
// ============================================================

function CatTower({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} />
      </mesh>

      {/* Main post */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 2.8, 12]} />
        <meshStandardMaterial color="#C4A574" roughness={0.95} />
      </mesh>

      {/* Lower platform */}
      <mesh position={[0.4, 1.2, 0]} castShadow>
        <boxGeometry args={[1, 0.15, 1]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.85} />
      </mesh>

      {/* Middle platform */}
      <mesh position={[-0.3, 2.2, 0.2]} castShadow>
        <boxGeometry args={[1.2, 0.15, 0.9]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.85} />
      </mesh>

      {/* Top perch */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.45, 0.15, 16]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.85} />
      </mesh>

      {/* Secondary post */}
      <mesh position={[0.5, 0.7, 0.3]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 12]} />
        <meshStandardMaterial color="#C4A574" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ============================================================
// MONSTERA PLANT (Realistic houseplant)
// ============================================================

// Pre-defined Monstera leaf configurations for consistent rendering
const MONSTERA_LEAVES = [
  // Large mature leaves (with characteristic splits)
  { stemPos: [0, 1.2, 0], stemRot: [-0.3, 0.8, 0], stemLen: 1.4, leafScale: 1.2, leafColor: '#1B5E20' },
  { stemPos: [0.1, 1.1, 0.1], stemRot: [0.2, -0.5, 0], stemLen: 1.5, leafScale: 1.3, leafColor: '#2E7D32' },
  { stemPos: [-0.05, 1.3, -0.05], stemRot: [-0.4, 2.2, 0], stemLen: 1.3, leafScale: 1.1, leafColor: '#1B5E20' },
  { stemPos: [0.08, 1.0, -0.08], stemRot: [0.3, 3.8, 0], stemLen: 1.6, leafScale: 1.4, leafColor: '#388E3C' },
  // Medium leaves
  { stemPos: [-0.12, 1.4, 0.06], stemRot: [-0.5, 1.5, 0], stemLen: 1.1, leafScale: 0.9, leafColor: '#43A047' },
  { stemPos: [0.06, 1.5, 0.1], stemRot: [0.1, -1.2, 0], stemLen: 1.0, leafScale: 0.85, leafColor: '#2E7D32' },
  { stemPos: [-0.08, 1.2, -0.1], stemRot: [-0.2, 4.5, 0], stemLen: 1.2, leafScale: 0.95, leafColor: '#1B5E20' },
  // Smaller/younger leaves
  { stemPos: [0.05, 1.6, 0], stemRot: [-0.1, 0.3, 0], stemLen: 0.7, leafScale: 0.6, leafColor: '#4CAF50' },
  { stemPos: [-0.03, 1.55, 0.05], stemRot: [0.2, 2.8, 0], stemLen: 0.6, leafScale: 0.5, leafColor: '#66BB6A' },
];

function MonsteraLeaf({ scale = 1, color = '#2E7D32' }: { scale?: number; color?: string }) {
  // Create a stylized Monstera leaf shape using multiple planes
  return (
    <group scale={[scale, scale, scale]}>
      {/* Main leaf body - heart-shaped base */}
      <mesh castShadow>
        <planeGeometry args={[0.8, 1.0]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Leaf lobes (the characteristic Monstera splits) */}
      <mesh position={[-0.35, 0.15, 0.01]} rotation={[0, 0, 0.3]} castShadow>
        <planeGeometry args={[0.35, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.35, 0.15, 0.01]} rotation={[0, 0, -0.3]} castShadow>
        <planeGeometry args={[0.35, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.28, -0.2, 0.01]} rotation={[0, 0, 0.5]} castShadow>
        <planeGeometry args={[0.25, 0.45]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.28, -0.2, 0.01]} rotation={[0, 0, -0.5]} castShadow>
        <planeGeometry args={[0.25, 0.45]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Central vein */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.03, 0.9, 0.01]} />
        <meshStandardMaterial color="#1B5E20" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PottedPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Woven basket-style pot */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.4, 1.0, 16]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* Pot rim */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <torusGeometry args={[0.48, 0.04, 8, 24]} />
        <meshStandardMaterial color="#7A6548" roughness={0.85} />
      </mesh>

      {/* Soil with slight mound */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#3E2723" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4E342E" roughness={0.95} />
      </mesh>

      {/* Monstera stems and leaves */}
      {MONSTERA_LEAVES.map((leaf, i) => (
        <group key={`monstera-${i}`}>
          {/* Stem */}
          <mesh
            position={[
              leaf.stemPos[0],
              leaf.stemPos[1] + leaf.stemLen / 2,
              leaf.stemPos[2]
            ]}
            rotation={leaf.stemRot as [number, number, number]}
            castShadow
          >
            <cylinderGeometry args={[0.025, 0.035, leaf.stemLen, 8]} />
            <meshStandardMaterial color="#33691E" roughness={0.8} />
          </mesh>

          {/* Leaf at end of stem */}
          <group
            position={[
              leaf.stemPos[0] + Math.sin(leaf.stemRot[1]) * leaf.stemLen * 0.8,
              leaf.stemPos[1] + leaf.stemLen * 0.9,
              leaf.stemPos[2] + Math.cos(leaf.stemRot[1]) * leaf.stemLen * 0.8
            ]}
            rotation={[
              leaf.stemRot[0] - 0.3,
              leaf.stemRot[1],
              0
            ]}
          >
            <MonsteraLeaf scale={leaf.leafScale} color={leaf.leafColor} />
          </group>
        </group>
      ))}

      {/* A few aerial roots for realism */}
      <mesh position={[0.15, 1.3, 0.1]} rotation={[0.2, 0.5, 0.1]} castShadow>
        <cylinderGeometry args={[0.008, 0.012, 0.6, 6]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      <mesh position={[-0.1, 1.25, -0.08]} rotation={[-0.15, -0.3, -0.1]} castShadow>
        <cylinderGeometry args={[0.006, 0.01, 0.45, 6]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ============================================================
// WALL PAINTING (Van Gogh - Cafe Terrace placeholder)
// ============================================================

// Pre-computed static star positions for the painting
const PAINTING_STARS = [
  { x: 42, y: 28, r: 4.2 }, { x: 128, y: 15, r: 5.1 }, { x: 205, y: 35, r: 3.8 },
  { x: 72, y: 82, r: 4.5 }, { x: 185, y: 68, r: 3.2 }, { x: 25, y: 105, r: 5.5 },
  { x: 155, y: 42, r: 4.0 }, { x: 88, y: 118, r: 3.6 }, { x: 220, y: 95, r: 4.8 },
  { x: 112, y: 65, r: 3.4 }, { x: 48, y: 55, r: 5.2 }, { x: 178, y: 22, r: 4.1 },
  { x: 15, y: 72, r: 3.9 }, { x: 235, y: 58, r: 4.6 }, { x: 95, y: 8, r: 5.0 },
  { x: 165, y: 98, r: 3.3 }, { x: 58, y: 132, r: 4.4 }, { x: 198, y: 115, r: 3.7 },
  { x: 138, y: 88, r: 4.3 }, { x: 32, y: 18, r: 5.3 },
];

function WallPainting({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  // Create a simple procedural "painting" texture representing Cafe Terrace at Night
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Night sky - deep blue gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 160);
      skyGrad.addColorStop(0, '#0a1a3a');
      skyGrad.addColorStop(1, '#1a3a5a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 256, 160);

      // Stars - using pre-computed static positions
      ctx.fillStyle = '#FFD700';
      for (const star of PAINTING_STARS) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cafe terrace (warm yellow/orange area)
      const cafeGrad = ctx.createLinearGradient(80, 160, 180, 320);
      cafeGrad.addColorStop(0, '#FFD54F');
      cafeGrad.addColorStop(1, '#FF8F00');
      ctx.fillStyle = cafeGrad;
      ctx.fillRect(80, 140, 100, 180);

      // Cobblestone street
      ctx.fillStyle = '#4A4A6A';
      ctx.fillRect(0, 200, 80, 120);
      ctx.fillRect(180, 200, 76, 120);

      // Building silhouettes
      ctx.fillStyle = '#1a2a4a';
      ctx.fillRect(0, 100, 60, 100);
      ctx.fillRect(200, 80, 56, 120);

      // Tables suggestion
      ctx.fillStyle = '#8B4513';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(90 + i * 25, 250 + i * 15, 15, 10);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 2.8, 0.12]} />
        <meshStandardMaterial color="#4A3728" roughness={0.6} />
      </mesh>

      {/* Canvas/Painting */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[1.9, 2.5]} />
        <meshBasicMaterial map={canvasTexture} />
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
  demoStage: number; // 0 = initial (table + 1 chair + plates), 1 = full chairs, 2 = cozy items added
}

function BlueprintGrid({ size = 50, divisions = 50 }: { size?: number; divisions?: number }) {
  return (
    <gridHelper
      args={[size, divisions, '#4A90E2', '#2A5080']}
      position={[0, 0.01, 0]}
    />
  );
}

function Scene({ showGrid, showBlueprint, showShadows, autoRotate, demoStage }: SceneProps) {
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

      {/* Dining Table - always visible, centered in room */}
      <DiningTable position={[0, 0, 0]} />

      {/* Plates on table - always visible (4 plates) */}
      <Plate position={[-1.2, 2.58, -0.5]} />
      <Plate position={[1.2, 2.58, -0.5]} />
      <Plate position={[-1.2, 2.58, 0.5]} />
      <Plate position={[1.2, 2.58, 0.5]} />

      {/* Initial single chair - always visible */}
      <DiningChair position={[0, 0, -2]} rotation={0} />

      {/* Additional chairs - visible after first prompt (demoStage >= 1) */}
      {demoStage >= 1 && (
        <>
          <DiningChair position={[0, 0, 2]} rotation={Math.PI} />
          <DiningChair position={[-2.8, 0, 0]} rotation={Math.PI / 2} />
          <DiningChair position={[2.8, 0, 0]} rotation={-Math.PI / 2} />
        </>
      )}

      {/* Cozy items - visible after second prompt (demoStage >= 2) */}
      {demoStage >= 2 && (
        <>
          {/* Cat tower near back wall, left side */}
          {/* positioned: dining-area back-left corner (near fireplace wall) */}
          <CatTower position={[-6.5, 0, -5.0]} rotation={[0, Math.PI / 4, 0]} />

          {/* dining area: back-right corner (same room as cat tower) */}
          {/* Clamped to dining area bounds: x < 5 to avoid staircase, z > -6 to stay off back wall */}
          <PottedPlant position={[3.5, 0, -4.9]} />

          {/* Painting on back wall - centered horizontally at eye level */}
          <WallPainting position={[0, 4.5, -DIMENSIONS.depth / 2 + 0.2]} rotation={0} />
        </>
      )}

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
  demoStage?: number;
}

export default function LivingRoomViewer({
  sceneObjects,
  selectedId,
  onSelect,
  showGrid = false,
  showBlueprint = false,
  showShadows = true,
  autoRotate = false,
  demoStage = 0,
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
            demoStage={demoStage}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
