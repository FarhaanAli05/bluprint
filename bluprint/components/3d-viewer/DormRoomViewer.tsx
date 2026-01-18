"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";

// ============================================================
// ROOM DIMENSIONS (in feet, converted to Three.js units)
// ============================================================
const ROOM = {
  width: 12,      // X axis
  depth: 14,      // Z axis
  height: 9,      // Y axis
  wallThickness: 0.3,
  baseboardHeight: 0.4,
};

// ============================================================
// MATERIALS
// ============================================================

// Wood grain pattern for furniture
function WoodMaterial({ color = "#8B7355", roughness = 0.6 }: { color?: string; roughness?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.1}
    />
  );
}

// Wall material
function WallMaterial() {
  return (
    <meshStandardMaterial
      color="#F5F5F0"
      roughness={0.9}
      metalness={0}
    />
  );
}

// Floor material with wood texture simulation
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
// ROOM STRUCTURE COMPONENTS
// ============================================================

function Floor() {
  // Create a wood plank pattern
  const floorRef = useRef<THREE.Mesh>(null);
  
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth, 20, 20]} />
        <meshStandardMaterial color="#C4A35A" roughness={0.35} metalness={0.05} />
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
          <meshStandardMaterial color="#A08040" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Walls() {
  return (
    <group>
      {/* Back wall (with window) */}
      <mesh position={[0, ROOM.height / 2, -ROOM.depth / 2]} receiveShadow>
        <boxGeometry args={[ROOM.width, ROOM.height, ROOM.wallThickness]} />
        <WallMaterial />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-ROOM.width / 2, ROOM.height / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM.wallThickness, ROOM.height, ROOM.depth]} />
        <WallMaterial />
      </mesh>
      
      {/* Right wall (with door area) */}
      <mesh position={[ROOM.width / 2, ROOM.height / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM.wallThickness, ROOM.height, ROOM.depth]} />
        <WallMaterial />
      </mesh>
      
      {/* Front wall (partial - viewing angle) */}
      <mesh position={[0, ROOM.height / 2, ROOM.depth / 2]} receiveShadow>
        <boxGeometry args={[ROOM.width, ROOM.height, ROOM.wallThickness]} />
        <meshStandardMaterial color="#F5F5F0" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Ceiling() {
  // Drop ceiling with tile pattern
  return (
    <group>
      <mesh position={[0, ROOM.height, 0]} receiveShadow>
        <boxGeometry args={[ROOM.width, 0.2, ROOM.depth]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>
      
      {/* Ceiling tile lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`tile-x-${i}`} position={[0, ROOM.height - 0.01, -ROOM.depth / 2 + i * 2]}>
          <boxGeometry args={[ROOM.width, 0.02, 0.02]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`tile-z-${i}`} position={[-ROOM.width / 2 + i * 2, ROOM.height - 0.01, 0]}>
          <boxGeometry args={[0.02, 0.02, ROOM.depth]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
      ))}
    </group>
  );
}

function Baseboards() {
  const baseboardThickness = 0.1;
  const baseboardInset = 0.01;
  const baseboardY = ROOM.baseboardHeight / 2 + 0.005;
  const backWallInnerZ = -ROOM.depth / 2 + ROOM.wallThickness / 2;
  const leftWallInnerX = -ROOM.width / 2 + ROOM.wallThickness / 2;
  const rightWallInnerX = ROOM.width / 2 - ROOM.wallThickness / 2;

  return (
    <group>
      {/* Back baseboard */}
      <mesh position={[0, baseboardY, backWallInnerZ + baseboardThickness / 2 + baseboardInset]}>
        <boxGeometry args={[ROOM.width, ROOM.baseboardHeight, baseboardThickness]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Left baseboard */}
      <mesh position={[leftWallInnerX + baseboardThickness / 2 + baseboardInset, baseboardY, 0]}>
        <boxGeometry args={[baseboardThickness, ROOM.baseboardHeight, ROOM.depth]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Right baseboard */}
      <mesh position={[rightWallInnerX - baseboardThickness / 2 - baseboardInset, baseboardY, 0]}>
        <boxGeometry args={[baseboardThickness, ROOM.baseboardHeight, ROOM.depth]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
    </group>
  );
}

// ============================================================
// WINDOW COMPONENT
// ============================================================

function Window() {
  const glassZ = 0.08;
  const largePaneWidth = 2.4;
  const smallPaneWidth = 1.2;
  const paneHeight = 3.6;
  const paneGap = 0.1;
  const dividerX = (largePaneWidth - smallPaneWidth) / 2 + paneGap / 2;

  return (
    <group position={[1.5, 4.5, -ROOM.depth / 2 + 0.32]}>
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[4, 4, 0.3]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      
      {/* Window glass - large pane */}
      <mesh position={[-dividerX, 0, glassZ]}>
        <boxGeometry args={[largePaneWidth, paneHeight, 0.02]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Window glass - small pane */}
      <mesh position={[dividerX, 0.4, glassZ]}>
        <boxGeometry args={[smallPaneWidth, paneHeight - 0.8, 0.02]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Vertical divider frame */}
      <mesh position={[dividerX - paneGap / 2, 0, 0.2]}>
        <boxGeometry args={[paneGap, 3.6, 0.15]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Radiator beneath window */}
      <group position={[0, -2.8, 0.3]}>
        <mesh>
          <boxGeometry args={[3.5, 1.2, 0.4]} />
          <meshStandardMaterial color="#E8E8E8" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Radiator vents */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-1.5 + i * 0.4, 0, 0.21]}>
            <boxGeometry args={[0.15, 0.8, 0.02]} />
            <meshStandardMaterial color="#CCCCCC" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ============================================================
// FURNITURE COMPONENTS
// ============================================================

function Bed() {
  // Twin bed: 75" L × 39" W × 24" H = 6.25' × 3.25' × 2'
  const bedLength = 6.25;
  const bedWidth = 3.25;
  const bedHeight = 2;
  const frameHeight = 0.8;
  
  return (
    <group position={[-ROOM.width / 2 + bedWidth / 2 + 0.5, 0, -1]}>
      {/* Bed frame */}
      <mesh position={[0, frameHeight / 2, 0]} castShadow>
        <boxGeometry args={[bedWidth, frameHeight, bedLength]} />
        <WoodMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      
      {/* Headboard */}
      <mesh position={[0, frameHeight + 1, -bedLength / 2 + 0.1]} castShadow>
        <boxGeometry args={[bedWidth, 2, 0.2]} />
        <WoodMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      
      {/* Footboard */}
      <mesh position={[0, frameHeight + 0.4, bedLength / 2 - 0.1]} castShadow>
        <boxGeometry args={[bedWidth, 0.8, 0.15]} />
        <WoodMaterial color="#8B6914" roughness={0.5} />
      </mesh>
      
      {/* Mattress */}
      <mesh position={[0, frameHeight + 0.4, 0]} castShadow>
        <boxGeometry args={[bedWidth - 0.2, 0.6, bedLength - 0.4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>
      
      {/* Bedding/Comforter */}
      <mesh position={[0, frameHeight + 0.75, 0.3]} castShadow>
        <boxGeometry args={[bedWidth - 0.1, 0.3, bedLength - 1]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.9} />
      </mesh>
      
      {/* Throw blanket */}
      <mesh position={[0, frameHeight + 0.9, bedLength / 2 - 1]} castShadow>
        <boxGeometry args={[bedWidth - 0.3, 0.15, 1.5]} />
        <meshStandardMaterial color="#C9B896" roughness={0.95} />
      </mesh>
      
      {/* Pillows */}
      <mesh position={[-0.7, frameHeight + 1, -bedLength / 2 + 0.8]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>
      <mesh position={[0.7, frameHeight + 1, -bedLength / 2 + 0.8]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.6]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>
      
      {/* Decorative pillow with chevron pattern */}
      <mesh position={[0, frameHeight + 1.1, -bedLength / 2 + 1.4]} castShadow>
        <boxGeometry args={[1, 0.3, 0.5]} />
        <meshStandardMaterial color="#A89070" roughness={0.9} />
      </mesh>
      
      {/* Bed legs */}
      {[
        [-bedWidth / 2 + 0.15, 0.35, -bedLength / 2 + 0.15],
        [bedWidth / 2 - 0.15, 0.35, -bedLength / 2 + 0.15],
        [-bedWidth / 2 + 0.15, 0.35, bedLength / 2 - 0.15],
        [bedWidth / 2 - 0.15, 0.35, bedLength / 2 - 0.15],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <WoodMaterial color="#8B6914" />
        </mesh>
      ))}
    </group>
  );
}

function DeskWithHutch() {
  // Desk: 48" W × 24" D × 30" H = 4' × 2' × 2.5'
  // Hutch adds another 2.5' height
  const deskWidth = 4;
  const deskDepth = 2;
  const deskHeight = 2.5;
  const hutchHeight = 2.5;
  
  return (
    <group position={[ROOM.width / 2 - deskWidth / 2 - 0.5, 0, -ROOM.depth / 2 + deskDepth / 2 + 1]}>
      {/* Desk surface */}
      <mesh position={[0, deskHeight, 0]} castShadow>
        <boxGeometry args={[deskWidth, 0.12, deskDepth]} />
        <WoodMaterial color="#9C7C4C" roughness={0.4} />
      </mesh>
      
      {/* Left desk panel */}
      <mesh position={[-deskWidth / 2 + 0.08, deskHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.15, deskHeight, deskDepth]} />
        <WoodMaterial color="#9C7C4C" />
      </mesh>
      
      {/* Right drawer unit */}
      <group position={[deskWidth / 2 - 0.6, 0, 0]}>
        {/* Drawer cabinet */}
        <mesh position={[0, deskHeight / 2, 0]} castShadow>
          <boxGeometry args={[1.1, deskHeight - 0.1, deskDepth - 0.1]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>
        
        {/* Drawers */}
        {[0.4, 1.2, 2].map((y, i) => (
          <group key={i}>
            <mesh position={[0.1, y, deskDepth / 2 - 0.1]} castShadow>
              <boxGeometry args={[0.9, 0.6, 0.08]} />
              <WoodMaterial color="#8B7040" />
            </mesh>
            {/* Drawer handle (blue) */}
            <mesh position={[0.1, y, deskDepth / 2]}>
              <boxGeometry args={[0.3, 0.08, 0.05]} />
              <meshStandardMaterial color="#4169E1" metalness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Hutch/Shelf unit */}
      <group position={[0, deskHeight + 0.1, -deskDepth / 2 + 0.5]}>
        {/* Hutch back panel */}
        <mesh position={[0, hutchHeight / 2, -0.4]} castShadow>
          <boxGeometry args={[deskWidth - 0.2, hutchHeight, 0.1]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>
        
        {/* Hutch side panels */}
        <mesh position={[-deskWidth / 2 + 0.15, hutchHeight / 2, 0]} castShadow>
          <boxGeometry args={[0.1, hutchHeight, 0.9]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>
        <mesh position={[deskWidth / 2 - 0.15, hutchHeight / 2, 0]} castShadow>
          <boxGeometry args={[0.1, hutchHeight, 0.9]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>
        
        {/* Hutch shelves */}
        {[0.8, 1.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[deskWidth - 0.4, 0.1, 0.8]} />
            <WoodMaterial color="#9C7C4C" />
          </mesh>
        ))}
        
        {/* Middle divider */}
        <mesh position={[0.5, 1.2, 0]} castShadow>
          <boxGeometry args={[0.08, 1.6, 0.7]} />
          <WoodMaterial color="#9C7C4C" />
        </mesh>
        
        {/* Decorative items on hutch */}
        {/* Clock */}
        <mesh position={[-0.8, 1.2, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Small decorative sphere */}
        <mesh position={[1, 1.2, 0.1]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Photo frames on top */}
        <mesh position={[-0.6, 2.2, 0]} castShadow rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <WoodMaterial color="#654321" />
        </mesh>
        <mesh position={[0.2, 2.15, 0.05]} castShadow rotation={[0, -0.1, 0]}>
          <boxGeometry args={[0.5, 0.7, 0.05]} />
          <WoodMaterial color="#654321" />
        </mesh>
        
        {/* Table lamp */}
        <group position={[-1.2, 0.3, 0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.2, 0.3, 16]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <coneGeometry args={[0.25, 0.35, 16, 1, true]} />
            <meshStandardMaterial color="#FFF8DC" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function OfficeChair() {
  return (
    <group position={[ROOM.width / 2 - 3, 0, 0.5]} rotation={[0, Math.PI, 0]}>
      {/* Chair base with wheels */}
      <group position={[0, 0.15, 0]}>
        {/* Star base */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <mesh key={i} rotation={[0, (angle * Math.PI) / 180, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.8]} />
            <meshStandardMaterial color="#1A1A1A" />
          </mesh>
        ))}
        {/* Wheels */}
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <mesh key={i} position={[Math.sin(rad) * 0.35, -0.05, Math.cos(rad) * 0.35]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          );
        })}
      </group>
      
      {/* Center column */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 1.2, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.7} />
      </mesh>
      
      {/* Seat */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.2, 0.15, 1.2]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </mesh>
      
      {/* Seat cushion */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <boxGeometry args={[1.1, 0.12, 1.1]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.95} />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, 2.5, -0.5]} castShadow rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.1, 1.4, 0.15]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} />
      </mesh>
      
      {/* Armrests */}
      <mesh position={[-0.55, 2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.55, 2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Armrest pads */}
      <mesh position={[-0.55, 2.3, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.5]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0.55, 2.3, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.5]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
    </group>
  );
}

function Wardrobe() {
  // Wardrobe: 48" W × 24" D × 72" H = 4' × 2' × 6'
  const wardrobeWidth = 4;
  const wardrobeDepth = 2;
  const wardrobeHeight = 6;
  const backWallInnerZ = -ROOM.depth / 2 + ROOM.wallThickness / 2;
  const backWallClearance = 0.02;
  const wardrobeZ = backWallInnerZ + wardrobeDepth / 2 + backWallClearance;
  
  return (
    <group position={[-ROOM.width / 2 + wardrobeWidth / 2 + 0.5, 0, wardrobeZ]}>
      {/* Main cabinet body */}
      <mesh position={[0, wardrobeHeight / 2, 0]} castShadow>
        <boxGeometry args={[wardrobeWidth, wardrobeHeight, wardrobeDepth]} />
        <WoodMaterial color="#A0784C" roughness={0.5} />
      </mesh>
      
      {/* Left door */}
      <mesh position={[-wardrobeWidth / 4, wardrobeHeight / 2, wardrobeDepth / 2 + 0.02]} castShadow>
        <boxGeometry args={[wardrobeWidth / 2 - 0.05, wardrobeHeight - 0.1, 0.08]} />
        <WoodMaterial color="#8B6914" roughness={0.4} />
      </mesh>
      
      {/* Right side - open shelving */}
      <group position={[wardrobeWidth / 4, 0, wardrobeDepth / 2 + 0.02]}>
        {/* Shelves */}
        {[1.5, 3, 4.5].map((y, i) => (
          <mesh key={i} position={[0, y, -0.4]} castShadow>
            <boxGeometry args={[wardrobeWidth / 2 - 0.15, 0.08, wardrobeDepth - 0.2]} />
            <WoodMaterial color="#9C7C4C" />
          </mesh>
        ))}
        
        {/* Drawers at bottom */}
        {[0.4, 0.9].map((y, i) => (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow>
              <boxGeometry args={[wardrobeWidth / 2 - 0.2, 0.4, 0.08]} />
              <WoodMaterial color="#8B7040" />
            </mesh>
            {/* Drawer handle */}
            <mesh position={[0, y, 0.06]}>
              <boxGeometry args={[0.4, 0.06, 0.04]} />
              <meshStandardMaterial color="#808080" metalness={0.7} />
            </mesh>
          </group>
        ))}
        
        {/* Items on shelves */}
        {/* Books */}
        <mesh position={[-0.3, 4.7, -0.3]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.3]} />
          <meshStandardMaterial color="#4A5568" />
        </mesh>
        
        {/* Storage baskets */}
        <mesh position={[0.2, 3.2, -0.3]} castShadow>
          <boxGeometry args={[0.8, 0.5, 0.7]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.95} />
        </mesh>
      </group>
      
      {/* Door handle */}
      <mesh position={[-0.2, wardrobeHeight / 2, wardrobeDepth / 2 + 0.12]}>
        <boxGeometry args={[0.08, 0.4, 0.04]} />
        <meshStandardMaterial color="#808080" metalness={0.7} />
      </mesh>
    </group>
  );
}

function CorkBoard({ position, rotation = [0, 0, 0], size = [2, 1.5] }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number];
  size?: [number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[size[0] + 0.15, size[1] + 0.15, 0.12]} />
        <WoodMaterial color="#8B7355" />
      </mesh>
      
      {/* Cork surface */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[size[0], size[1], 0.08]} />
        <meshStandardMaterial color="#C4956A" roughness={0.98} />
      </mesh>
      
      {/* Pinned paper with shield */}
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#FFF8DC" />
      </mesh>
      
      {/* Shield emblem */}
      <mesh position={[0, 0.1, 0.13]}>
        <boxGeometry args={[0.4, 0.5, 0.02]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
    </group>
  );
}

function CeilingLight() {
  return (
    <group position={[0, ROOM.height - 0.3, 0]}>
      {/* Light fixture base */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Light dome */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#FFFACD" 
          transparent 
          opacity={0.9}
          emissive="#FFF8DC"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Point light inside */}
      <pointLight
        position={[0, -0.1, 0]}
        intensity={0.8}
        distance={15}
        color="#FFF8DC"
        castShadow
      />
    </group>
  );
}

function RedBag() {
  return (
    <group position={[-ROOM.width / 2 + 1.5, 0.4, 2]}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.3]} />
        <meshStandardMaterial color="#B22222" roughness={0.8} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.2, 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#B22222" />
      </mesh>
    </group>
  );
}

// ============================================================
// SCENE AND CONTROLS
// ============================================================

function Scene() {
  const controlsRef = useRef<any>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInteractionStart = () => {
    setIsUserInteracting(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    timeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light from window */}
      <directionalLight
        position={[2, 5, -8]}
        intensity={0.4}
        color="#87CEEB"
      />
      
      {/* Room Structure */}
      <Floor />
      <Walls />
      <Ceiling />
      <Baseboards />
      <Window />
      <CeilingLight />
      
      {/* Furniture */}
      <Bed />
      <DeskWithHutch />
      <OfficeChair />
      <Wardrobe />
      <RedBag />
      
      {/* Cork boards */}
      <CorkBoard 
        position={[2, 5, -ROOM.depth / 2 + 0.2]} 
        size={[2, 1.5]}
      />
      <CorkBoard 
        position={[ROOM.width / 2 - 0.2, 5, 2]} 
        rotation={[0, -Math.PI / 2, 0]}
        size={[1.5, 1]}
      />
      
      {/* Camera Controls */}
      <OrbitControls
        ref={controlsRef}
        autoRotate={!isUserInteracting}
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={0.2}
        target={[0, 3, 0]}
        onStart={handleInteractionStart}
        onEnd={handleInteractionEnd}
      />
    </>
  );
}

// ============================================================
// LOADING COMPONENT
// ============================================================

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

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DormRoomViewer() {
  const [showControls, setShowControls] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full w-full min-h-[500px] bg-slate-900 rounded-xl overflow-hidden">
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
        >
          <color attach="background" args={["#1a1a2e"]} />
          <fog attach="fog" args={["#1a1a2e", 20, 40]} />
          <Scene />
        </Canvas>
      </Suspense>

      {/* Control hints overlay */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="rounded-xl bg-black/60 px-6 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-6 text-sm text-white/80">
              <span>🖱️ Drag to rotate</span>
              <span>🔍 Scroll to zoom</span>
              <span>👆 Right-drag to pan</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          {showControls ? "Hide" : "Show"} Controls
        </button>
      </div>

      {/* Room info */}
      <div className="absolute bottom-4 left-4">
        <div className="rounded-xl bg-black/60 px-4 py-2 backdrop-blur-sm">
          <p className="text-xs text-white/60">Dorm Room</p>
          <p className="text-sm font-medium text-white">12' × 14' × 9'</p>
        </div>
      </div>
    </div>
  );
}
