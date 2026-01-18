"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SceneObject } from "@/lib/dormRoomState";

// ============================================================
// ROOM CONSTANTS (matching reference photos)
// ============================================================

const DIMENSIONS = {
  width: 12,
  depth: 14,
  height: 9,
  wallThickness: 0.15,
  baseboardHeight: 0.4,
};

const FURNITURE_SIZES = {
  bed: { width: 3.25, depth: 6.25, height: 2, frameHeight: 0.8 },
  desk: { width: 4, depth: 2, height: 2.5 },
  hutch: { height: 2.5 },
  chair: { width: 1.2, depth: 1.2, seatHeight: 1.5 },
  wardrobe: { width: 4, depth: 2, height: 6 },
  window: { width: 4, height: 4 },
  radiator: { width: 3.5, height: 1.2, depth: 0.4 },
};

// ============================================================
// MATERIALS
// ============================================================

function WoodMaterial({ color = "#8B7355", roughness = 0.6 }: { color?: string; roughness?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.05}
    />
  );
}

// ============================================================
// ROOM STRUCTURE COMPONENTS
// ============================================================

function Floor() {
  return (
    <group>
      {/* Main floor - wood planks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[DIMENSIONS.width, DIMENSIONS.depth, 20, 20]} />
        <meshStandardMaterial color="#C4A35A" roughness={0.4} metalness={0.02} />
      </mesh>

      {/* Floor plank lines */}
      {Array.from({ length: Math.floor(DIMENSIONS.depth / 0.5) }).map((_, i) => (
        <mesh
          key={`plank-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, -DIMENSIONS.depth / 2 + i * 0.5 + 0.25]}
          receiveShadow
        >
          <planeGeometry args={[DIMENSIONS.width, 0.015]} />
          <meshStandardMaterial color="#A08040" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Baseboards() {
  const baseY = DIMENSIONS.baseboardHeight / 2;
  const thickness = 0.08;

  return (
    <group>
      {/* Back wall baseboard */}
      <mesh position={[0, baseY, -DIMENSIONS.depth / 2 + thickness / 2 + 0.01]}>
        <boxGeometry args={[DIMENSIONS.width, DIMENSIONS.baseboardHeight, thickness]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>

      {/* Left wall baseboard */}
      <mesh position={[-DIMENSIONS.width / 2 + thickness / 2 + 0.01, baseY, 0]}>
        <boxGeometry args={[thickness, DIMENSIONS.baseboardHeight, DIMENSIONS.depth]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>

      {/* Right wall baseboard */}
      <mesh position={[DIMENSIONS.width / 2 - thickness / 2 - 0.01, baseY, 0]}>
        <boxGeometry args={[thickness, DIMENSIONS.baseboardHeight, DIMENSIONS.depth]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>

      {/* Front wall baseboard */}
      <mesh position={[0, baseY, DIMENSIONS.depth / 2 - thickness / 2 - 0.01]}>
        <boxGeometry args={[DIMENSIONS.width, DIMENSIONS.baseboardHeight, thickness]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Ceiling() {
  return (
    <group>
      {/* Main ceiling */}
      <mesh position={[0, DIMENSIONS.height, 0]} receiveShadow>
        <boxGeometry args={[DIMENSIONS.width, 0.15, DIMENSIONS.depth]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>

      {/* Ceiling panel lines - create drop tile effect */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`tile-x-${i}`} position={[0, DIMENSIONS.height - 0.08, -DIMENSIONS.depth / 2 + i * 2]}>
          <boxGeometry args={[DIMENSIONS.width, 0.015, 0.015]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`tile-z-${i}`} position={[-DIMENSIONS.width / 2 + i * 2, DIMENSIONS.height - 0.08, 0]}>
          <boxGeometry args={[0.015, 0.015, DIMENSIONS.depth]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
      ))}
    </group>
  );
}

function CeilingLight() {
  return (
    <group position={[0, DIMENSIONS.height - 0.25, 0]}>
      {/* Light fixture base */}
      <mesh>
        <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Light dome */}
      <mesh position={[0, -0.15, 0]}>
        <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#FFFACD"
          transparent
          opacity={0.9}
          emissive="#FFF8DC"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        position={[0, -0.1, 0]}
        intensity={1.2}
        distance={15}
        decay={2}
        color="#FFF8DC"
        castShadow
        shadow-bias={-0.0001}
      />
    </group>
  );
}

function AdaptiveWalls() {
  const { camera } = useThree();
  const [opacities, setOpacities] = useState({ front: 0.05, back: 1, left: 1, right: 1 });

  const wallRefs = {
    front: useRef<THREE.Mesh>(null),
    back: useRef<THREE.Mesh>(null),
    left: useRef<THREE.Mesh>(null),
    right: useRef<THREE.Mesh>(null),
  };

  useFrame(() => {
    if (!camera) return;

    const roomCenter = new THREE.Vector3(0, DIMENSIONS.height / 2, 0);
    const cameraToRoom = new THREE.Vector3().subVectors(roomCenter, camera.position).normalize();

    // Calculate which wall is most blocking the view
    const newOpacities = {
      front: cameraToRoom.z > 0.4 ? THREE.MathUtils.lerp(opacities.front, 0.05, 0.1) : THREE.MathUtils.lerp(opacities.front, 1, 0.1),
      back: cameraToRoom.z < -0.4 ? THREE.MathUtils.lerp(opacities.back, 0.05, 0.1) : THREE.MathUtils.lerp(opacities.back, 1, 0.1),
      left: cameraToRoom.x < -0.4 ? THREE.MathUtils.lerp(opacities.left, 0.05, 0.1) : THREE.MathUtils.lerp(opacities.left, 1, 0.1),
      right: cameraToRoom.x > 0.4 ? THREE.MathUtils.lerp(opacities.right, 0.05, 0.1) : THREE.MathUtils.lerp(opacities.right, 1, 0.1),
    };

    setOpacities(newOpacities);

    // Apply to materials
    if (wallRefs.front.current) (wallRefs.front.current.material as THREE.MeshStandardMaterial).opacity = newOpacities.front;
    if (wallRefs.back.current) (wallRefs.back.current.material as THREE.MeshStandardMaterial).opacity = newOpacities.back;
    if (wallRefs.left.current) (wallRefs.left.current.material as THREE.MeshStandardMaterial).opacity = newOpacities.left;
    if (wallRefs.right.current) (wallRefs.right.current.material as THREE.MeshStandardMaterial).opacity = newOpacities.right;
  });

  const wallMaterial = (opacity: number) => (
    <meshStandardMaterial
      color="#F5F5F0"
      transparent
      opacity={opacity}
      roughness={0.9}
      side={THREE.DoubleSide}
      depthWrite={opacity > 0.5}
    />
  );

  return (
    <group>
      {/* Back wall (with window) */}
      <mesh ref={wallRefs.back} position={[0, DIMENSIONS.height / 2, -DIMENSIONS.depth / 2]} receiveShadow>
        <boxGeometry args={[DIMENSIONS.width, DIMENSIONS.height, DIMENSIONS.wallThickness]} />
        {wallMaterial(opacities.back)}
      </mesh>

      {/* Front wall */}
      <mesh ref={wallRefs.front} position={[0, DIMENSIONS.height / 2, DIMENSIONS.depth / 2]} receiveShadow>
        <boxGeometry args={[DIMENSIONS.width, DIMENSIONS.height, DIMENSIONS.wallThickness]} />
        {wallMaterial(opacities.front)}
      </mesh>

      {/* Left wall */}
      <mesh ref={wallRefs.left} position={[-DIMENSIONS.width / 2, DIMENSIONS.height / 2, 0]} receiveShadow>
        <boxGeometry args={[DIMENSIONS.wallThickness, DIMENSIONS.height, DIMENSIONS.depth]} />
        {wallMaterial(opacities.left)}
      </mesh>

      {/* Right wall (long blank wall) */}
      <mesh ref={wallRefs.right} position={[DIMENSIONS.width / 2, DIMENSIONS.height / 2, 0]} receiveShadow>
        <boxGeometry args={[DIMENSIONS.wallThickness, DIMENSIONS.height, DIMENSIONS.depth]} />
        {wallMaterial(opacities.right)}
      </mesh>
    </group>
  );
}

function WindowUnit() {
  const w = FURNITURE_SIZES.window;

  return (
    <group position={[1.5, w.height + 1, -DIMENSIONS.depth / 2 + 0.2]}>
      {/* Window frame */}
      <mesh castShadow>
        <boxGeometry args={[w.width, w.height, 0.25]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
      </mesh>

      {/* Top pane (larger) */}
      <mesh position={[0, w.height / 4, 0.15]}>
        <boxGeometry args={[w.width - 0.3, w.height / 2 - 0.15, 0.03]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.4}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Bottom pane (smaller, sliding) */}
      <mesh position={[0, -w.height / 4, 0.15]}>
        <boxGeometry args={[w.width - 0.3, w.height / 2 - 0.15, 0.03]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.4}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Divider between panes */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[w.width - 0.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

function Radiator() {
  const r = FURNITURE_SIZES.radiator;

  return (
    <group position={[1.5, r.height / 2 + 0.1, -DIMENSIONS.depth / 2 + r.depth / 2 + 0.25]}>
      {/* Main radiator body */}
      <mesh castShadow>
        <boxGeometry args={[r.width, r.height, r.depth]} />
        <meshStandardMaterial color="#E8E8E8" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Vent slats */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-r.width / 2 + 0.5 + i * 0.4, 0, r.depth / 2 + 0.02]}>
          <boxGeometry args={[0.15, r.height - 0.3, 0.02]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
      ))}
    </group>
  );
}

function CorkBoard() {
  return (
    <group position={[3, 5, -DIMENSIONS.depth / 2 + 0.12]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <WoodMaterial color="#8B7355" />
      </mesh>

      {/* Cork surface */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.85, 1.35, 0.05]} />
        <meshStandardMaterial color="#C4956A" roughness={0.98} />
      </mesh>
    </group>
  );
}

// ============================================================
// FURNITURE COMPONENTS (using props for positioning)
// ============================================================

function Bed({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const b = FURNITURE_SIZES.bed;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Bed frame */}
      <mesh position={[0, b.frameHeight / 2, 0]} castShadow>
        <boxGeometry args={[b.width, b.frameHeight, b.depth]} />
        <WoodMaterial color="#8B6914" roughness={0.5} />
      </mesh>

      {/* Headboard */}
      <mesh position={[0, b.frameHeight + 1, -b.depth / 2 + 0.1]} castShadow>
        <boxGeometry args={[b.width, 2, 0.2]} />
        <WoodMaterial color="#8B6914" roughness={0.5} />
      </mesh>

      {/* Footboard */}
      <mesh position={[0, b.frameHeight + 0.4, b.depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[b.width, 0.8, 0.15]} />
        <WoodMaterial color="#8B6914" roughness={0.5} />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, b.frameHeight + 0.4, 0]} castShadow>
        <boxGeometry args={[b.width - 0.2, 0.6, b.depth - 0.4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>

      {/* White bedding/comforter */}
      <mesh position={[0, b.frameHeight + 0.75, 0.3]} castShadow>
        <boxGeometry args={[b.width - 0.15, 0.25, b.depth - 1.2]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>

      {/* Folded blanket at foot */}
      <mesh position={[0, b.frameHeight + 0.9, b.depth / 2 - 1]} castShadow>
        <boxGeometry args={[b.width - 0.3, 0.15, 1.5]} />
        <meshStandardMaterial color="#C9B896" roughness={0.95} />
      </mesh>

      {/* Pillows */}
      <mesh position={[-0.7, b.frameHeight + 1, -b.depth / 2 + 0.8]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>
      <mesh position={[0.7, b.frameHeight + 1, -b.depth / 2 + 0.8]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>

      {/* Decorative chevron pillow */}
      <mesh position={[0, b.frameHeight + 1.1, -b.depth / 2 + 1.4]} castShadow>
        <boxGeometry args={[1, 0.3, 0.5]} />
        <meshStandardMaterial color="#A89070" roughness={0.9} />
      </mesh>

      {/* Bed legs */}
      {[
        [-b.width / 2 + 0.15, 0.35, -b.depth / 2 + 0.15],
        [b.width / 2 - 0.15, 0.35, -b.depth / 2 + 0.15],
        [-b.width / 2 + 0.15, 0.35, b.depth / 2 - 0.15],
        [b.width / 2 - 0.15, 0.35, b.depth / 2 - 0.15],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <WoodMaterial color="#8B6914" />
        </mesh>
      ))}
    </group>
  );
}

function DeskWithHutch({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const d = FURNITURE_SIZES.desk;
  const h = FURNITURE_SIZES.hutch;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desk surface */}
      <mesh position={[0, d.height, 0]} castShadow>
        <boxGeometry args={[d.width, 0.12, d.depth]} />
        <WoodMaterial color="#9C7C4C" roughness={0.35} />
      </mesh>

      {/* Left desk panel */}
      <mesh position={[-d.width / 2 + 0.08, d.height / 2, 0]} castShadow>
        <boxGeometry args={[0.15, d.height, d.depth]} />
        <WoodMaterial color="#9C7C4C" />
      </mesh>

      {/* Right drawer unit */}
      <group position={[d.width / 2 - 0.6, 0, 0]}>
        <mesh position={[0, d.height / 2, 0]} castShadow>
          <boxGeometry args={[1.1, d.height - 0.1, d.depth - 0.1]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>

        {/* Three drawers */}
        {[0.6, 1.4, 2.1].map((y, i) => (
          <group key={i}>
            <mesh position={[0.05, y, d.depth / 2 - 0.08]} castShadow>
              <boxGeometry args={[0.95, 0.6, 0.08]} />
              <WoodMaterial color="#8B7040" />
            </mesh>
            {/* Drawer handle */}
            <mesh position={[0.05, y, d.depth / 2]}>
              <boxGeometry args={[0.35, 0.08, 0.04]} />
              <meshStandardMaterial color="#4169E1" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Hutch/shelf unit above */}
      <group position={[0, d.height + 0.08, -d.depth / 2 + 0.5]}>
        {/* Hutch back panel */}
        <mesh position={[0, h.height / 2, -0.42]} castShadow>
          <boxGeometry args={[d.width - 0.2, h.height, 0.1]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>

        {/* Hutch side panels */}
        <mesh position={[-d.width / 2 + 0.15, h.height / 2, 0]} castShadow>
          <boxGeometry args={[0.1, h.height, 0.85]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>
        <mesh position={[d.width / 2 - 0.15, h.height / 2, 0]} castShadow>
          <boxGeometry args={[0.1, h.height, 0.85]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>

        {/* Hutch shelves */}
        {[0.8, 1.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[d.width - 0.4, 0.08, 0.75]} />
            <WoodMaterial color="#9C7C4C" />
          </mesh>
        ))}

        {/* Middle vertical divider */}
        <mesh position={[0.5, 1.2, 0]} castShadow>
          <boxGeometry args={[0.08, 1.6, 0.7]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>

        {/* Decorative items on hutch */}
        {/* Small picture frames on top shelf */}
        <mesh position={[-0.6, 2.15, 0.1]} castShadow rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.5, 0.7, 0.05]} />
          <WoodMaterial color="#654321" />
        </mesh>
        <mesh position={[0.3, 2.2, 0.05]} castShadow rotation={[0, -0.15, 0]}>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <WoodMaterial color="#654321" />
        </mesh>

        {/* Decorative sphere */}
        <mesh position={[1, 1.2, 0.1]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Small table lamp on desk surface */}
        <group position={[-1.3, -d.height - 0.05, 0.4]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.25, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.65, 0]} castShadow>
            <coneGeometry args={[0.22, 0.3, 16, 1, true]} />
            <meshStandardMaterial color="#FFF8DC" side={THREE.DoubleSide} roughness={0.7} />
          </mesh>
        </group>
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
  const w = FURNITURE_SIZES.wardrobe;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main cabinet body */}
      <mesh position={[0, w.height / 2, 0]} castShadow>
        <boxGeometry args={[w.width, w.height, w.depth]} />
        <WoodMaterial color="#A0784C" roughness={0.5} />
      </mesh>

      {/* Left door panel */}
      <mesh position={[-w.width / 4, w.height / 2, w.depth / 2 + 0.03]} castShadow>
        <boxGeometry args={[w.width / 2 - 0.06, w.height - 0.15, 0.08]} />
        <WoodMaterial color="#8B6914" roughness={0.4} />
      </mesh>

      {/* Door handle */}
      <mesh position={[-0.15, w.height / 2, w.depth / 2 + 0.09]}>
        <boxGeometry args={[0.08, 0.35, 0.04]} />
        <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Right side - open shelving */}
      <group position={[w.width / 4, 0, w.depth / 2 + 0.02]}>
        {/* Shelves */}
        {[1.5, 3, 4.5].map((y, i) => (
          <mesh key={i} position={[0, y, -0.45]} castShadow>
            <boxGeometry args={[w.width / 2 - 0.15, 0.08, w.depth - 0.25]} />
            <WoodMaterial color="#9C7C4C" />
          </mesh>
        ))}

        {/* Drawers at bottom */}
        {[0.4, 0.9].map((y, i) => (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow>
              <boxGeometry args={[w.width / 2 - 0.2, 0.4, 0.08]} />
              <WoodMaterial color="#8B7040" />
            </mesh>
            {/* Drawer handle */}
            <mesh position={[0, y, 0.06]}>
              <boxGeometry args={[0.4, 0.06, 0.04]} />
              <meshStandardMaterial color="#808080" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Items on shelves - books */}
        <mesh position={[-0.3, 4.7, -0.35]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.25]} />
          <meshStandardMaterial color="#4A5568" roughness={0.8} />
        </mesh>

        {/* Storage basket */}
        <mesh position={[0.15, 3.2, -0.3]} castShadow>
          <boxGeometry args={[0.75, 0.45, 0.6]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.95} />
        </mesh>
      </group>
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

function Scene({ sceneObjects, onSelect }: SceneProps) {
  const controlsRef = useRef<any>(null);

  const renderFurniture = (obj: SceneObject) => {
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
      <color attach="background" args={["#1a1a2e"]} />
      <fog attach="fog" args={["#1a1a2e", 25, 50]} />

      {/* Hemisphere light for ambient bounce */}
      <hemisphereLight args={["#ffffff", "#444444", 0.6]} />

      {/* Directional light from window (daylight) */}
      <directionalLight
        position={[3, 8, -10]}
        intensity={1.0}
        color="#E0E8FF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* Fill light */}
      <directionalLight
        position={[-5, 5, 5]}
        intensity={0.3}
        color="#FFF8DC"
      />

      {/* Room structure */}
      <Floor />
      <Baseboards />
      <AdaptiveWalls />
      <Ceiling />
      <CeilingLight />

      {/* Window and radiator */}
      <WindowUnit />
      <Radiator />
      <CorkBoard />

      {/* Furniture from state */}
      {sceneObjects.map(renderFurniture)}

      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={8}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minPolarAngle={0.1}
        target={[0, 2.5, 0]}
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
