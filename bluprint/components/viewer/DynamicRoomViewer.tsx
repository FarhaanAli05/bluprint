"use client";

// ============================================================
// Dynamic Room Viewer Component
// Generates 3D room from AI analysis data
// ============================================================

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import type {
  AIRoomData,
  FurnitureItem,
  WindowSpec,
  DoorSpec,
  LightingFixture,
  DecorationItem,
} from "@/types/ai-room.types";
import { Loader2 } from "lucide-react";

// ============================================================
// Props
// ============================================================

interface DynamicRoomViewerProps {
  roomData: AIRoomData;
  autoRotate?: boolean;
  showGrid?: boolean;
  onLoadComplete?: () => void;
}

// ============================================================
// Materials Factory
// ============================================================

function getMaterial(
  color: string,
  materialType: string,
  options?: { roughness?: number; metalness?: number }
): THREE.MeshStandardMaterial {
  const baseOptions = { color };

  switch (materialType) {
    case "wood":
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        roughness: options?.roughness ?? 0.6,
        metalness: options?.metalness ?? 0.1,
      });
    case "metal":
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        roughness: options?.roughness ?? 0.3,
        metalness: options?.metalness ?? 0.8,
      });
    case "fabric":
    case "leather":
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        roughness: options?.roughness ?? 0.9,
        metalness: options?.metalness ?? 0,
      });
    case "plastic":
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        roughness: options?.roughness ?? 0.5,
        metalness: options?.metalness ?? 0.1,
      });
    case "glass":
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        roughness: options?.roughness ?? 0.1,
        metalness: options?.metalness ?? 0,
        transparent: true,
        opacity: 0.3,
      });
    default:
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        roughness: options?.roughness ?? 0.5,
        metalness: options?.metalness ?? 0.1,
      });
  }
}

// ============================================================
// Room Structure Components
// ============================================================

interface RoomStructureProps {
  dimensions: { length: number; width: number; height: number };
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  floorMaterial: string;
}

function RoomStructure({
  dimensions,
  wallColor,
  floorColor,
  ceilingColor,
  floorMaterial,
}: RoomStructureProps) {
  const { length, width, height } = dimensions;

  // Create floor material based on type
  const floorMat = getMaterial(floorColor, floorMaterial);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color={floorColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Back Wall (-Z) */}
      <mesh position={[0, height / 2, -width / 2]} receiveShadow>
        <boxGeometry args={[length, height, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Front Wall (+Z) */}
      <mesh position={[0, height / 2, width / 2]} receiveShadow>
        <boxGeometry args={[length, height, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Left Wall (-X) */}
      <mesh position={[-length / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, height, width]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Right Wall (+X) */}
      <mesh position={[length / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, height, width]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, 0]}
        receiveShadow
      >
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial
          color={ceilingColor}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Baseboard - all walls */}
      <group>
        {/* Back baseboard */}
        <mesh position={[0, 0.15, -width / 2 + 0.1]}>
          <boxGeometry args={[length - 0.2, 0.3, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Front baseboard */}
        <mesh position={[0, 0.15, width / 2 - 0.1]}>
          <boxGeometry args={[length - 0.2, 0.3, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Left baseboard */}
        <mesh position={[-length / 2 + 0.1, 0.15, 0]}>
          <boxGeometry args={[0.1, 0.3, width - 0.2]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        {/* Right baseboard */}
        <mesh position={[length / 2 - 0.1, 0.15, 0]}>
          <boxGeometry args={[0.1, 0.3, width - 0.2]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================
// Window Component
// ============================================================

interface WindowComponentProps {
  spec: WindowSpec;
  roomDimensions: { length: number; width: number };
}

function WindowComponent({ spec, roomDimensions }: WindowComponentProps) {
  const { length, width } = roomDimensions;
  
  // Calculate position based on wall
  let position: [number, number, number] = [0, spec.position.y + spec.height / 2, 0];
  let rotation: [number, number, number] = [0, 0, 0];

  switch (spec.wall) {
    case "north":
      position = [spec.position.x - length / 2, spec.position.y + spec.height / 2, -width / 2];
      rotation = [0, 0, 0];
      break;
    case "south":
      position = [spec.position.x - length / 2, spec.position.y + spec.height / 2, width / 2];
      rotation = [0, Math.PI, 0];
      break;
    case "east":
      position = [length / 2, spec.position.y + spec.height / 2, spec.position.x - width / 2];
      rotation = [0, -Math.PI / 2, 0];
      break;
    case "west":
      position = [-length / 2, spec.position.y + spec.height / 2, spec.position.x - width / 2];
      rotation = [0, Math.PI / 2, 0];
      break;
  }

  return (
    <group position={position} rotation={rotation}>
      {/* Window Frame */}
      <mesh>
        <boxGeometry args={[spec.width + 0.2, spec.height + 0.2, 0.3]} />
        <meshStandardMaterial color="#E8E4DC" roughness={0.8} />
      </mesh>
      
      {/* Glass */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[spec.width - 0.1, spec.height - 0.1, 0.05]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.4}
          roughness={0.1}
        />
      </mesh>

      {/* Window divider (for double windows) */}
      {spec.type === "double" && (
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.1, spec.height - 0.1, 0.1]} />
          <meshStandardMaterial color="#E8E4DC" roughness={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ============================================================
// Furniture Components
// ============================================================

function BedComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color, details } = item;
  const material = getMaterial(color, item.material);
  const woodFinish = details?.woodFinish || "medium";
  const frameColor = woodFinish === "light" ? "#C4A35A" : woodFinish === "dark" ? "#4A3520" : color;

  return (
    <group>
      {/* Frame Base */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[dimensions.width, 0.5, dimensions.depth]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} />
      </mesh>

      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <mesh
          key={i}
          position={[
            (dimensions.width / 2 - 0.15) * x,
            0.15,
            (dimensions.depth / 2 - 0.15) * z,
          ]}
          castShadow
        >
          <boxGeometry args={[0.15, 0.3, 0.15]} />
          <meshStandardMaterial color={frameColor} roughness={0.6} />
        </mesh>
      ))}

      {/* Mattress */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry
          args={[dimensions.width - 0.2, 0.4, dimensions.depth - 0.2]}
        />
        <meshStandardMaterial color="#F8F8F8" roughness={0.9} />
      </mesh>

      {/* Bedding/Comforter */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry
          args={[dimensions.width - 0.1, 0.15, dimensions.depth - 0.3]}
        />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>

      {/* Pillow */}
      <mesh position={[0, 1.1, -dimensions.depth / 2 + 0.5]} castShadow>
        <boxGeometry args={[dimensions.width - 0.5, 0.2, 0.6]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
      </mesh>

      {/* Headboard (if specified) */}
      {details?.hasHeadboard !== false && (
        <mesh
          position={[0, 1.5, -dimensions.depth / 2 - 0.1]}
          castShadow
        >
          <boxGeometry args={[dimensions.width + 0.1, 2, 0.2]} />
          <meshStandardMaterial color={frameColor} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

function DeskComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color, details } = item;
  const hasDrawers = details?.hasDrawers ?? true;
  const hasShelves = details?.hasShelves ?? false;

  return (
    <group>
      {/* Desktop */}
      <mesh position={[0, dimensions.height - 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[dimensions.width, 0.1, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <mesh
          key={i}
          position={[
            (dimensions.width / 2 - 0.1) * x,
            (dimensions.height - 0.1) / 2,
            (dimensions.depth / 2 - 0.1) * z,
          ]}
          castShadow
        >
          <boxGeometry args={[0.1, dimensions.height - 0.2, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}

      {/* Drawer Unit */}
      {hasDrawers && (
        <group position={[dimensions.width / 2 - 0.6, dimensions.height / 2 - 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1, dimensions.height - 0.4, dimensions.depth - 0.2]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Drawer handles */}
          {[0.5, 0, -0.5].map((y, i) => (
            <mesh key={i} position={[-0.55, y, 0]} castShadow>
              <boxGeometry args={[0.1, 0.15, 0.4]} />
              <meshStandardMaterial color="#4A90D9" roughness={0.4} metalness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {/* Hutch/Shelves */}
      {hasShelves && (
        <group position={[0, dimensions.height + 1, -dimensions.depth / 2 + 0.2]}>
          {/* Back panel */}
          <mesh castShadow>
            <boxGeometry args={[dimensions.width, 2, 0.1]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Shelves */}
          {[0.3, 1, 1.7].map((y, i) => (
            <mesh key={i} position={[0, y - 1, 0.3]} castShadow>
              <boxGeometry args={[dimensions.width - 0.1, 0.08, 0.5]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          ))}
          {/* Shelf dividers */}
          {[-dimensions.width / 3, dimensions.width / 3].map((x, i) => (
            <mesh key={i} position={[x, 0, 0.3]} castShadow>
              <boxGeometry args={[0.08, 2, 0.5]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function ChairComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color, details } = item;
  const hasArmrests = details?.hasArmrests ?? false;
  const isOfficeChair = item.subtype?.includes("office");

  return (
    <group>
      {/* Seat */}
      <mesh position={[0, dimensions.height / 2, 0]} castShadow>
        <boxGeometry args={[dimensions.width * 0.8, 0.15, dimensions.depth * 0.8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Backrest */}
      <mesh
        position={[0, dimensions.height * 0.75, -dimensions.depth / 2 + 0.1]}
        castShadow
      >
        <boxGeometry args={[dimensions.width * 0.75, dimensions.height * 0.5, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Office chair base */}
      {isOfficeChair ? (
        <group>
          {/* Central column */}
          <mesh position={[0, dimensions.height / 4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, dimensions.height / 2]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Star base */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((angle * Math.PI) / 180) * 0.4,
                0.08,
                Math.cos((angle * Math.PI) / 180) * 0.4,
              ]}
              rotation={[0, (angle * Math.PI) / 180, 0]}
              castShadow
            >
              <boxGeometry args={[0.08, 0.08, 0.8]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} />
            </mesh>
          ))}
          {/* Wheels */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((angle * Math.PI) / 180) * 0.7,
                0.08,
                Math.cos((angle * Math.PI) / 180) * 0.7,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ) : (
        // Regular chair legs
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
          <mesh
            key={i}
            position={[
              (dimensions.width / 2 - 0.1) * x * 0.8,
              dimensions.height / 4,
              (dimensions.depth / 2 - 0.1) * z * 0.8,
            ]}
            castShadow
          >
            <boxGeometry args={[0.08, dimensions.height / 2, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        ))
      )}

      {/* Armrests */}
      {hasArmrests && (
        <>
          <mesh
            position={[-dimensions.width / 2 + 0.1, dimensions.height * 0.6, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.08, dimensions.depth * 0.6]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh
            position={[dimensions.width / 2 - 0.1, dimensions.height * 0.6, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.08, dimensions.depth * 0.6]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </>
      )}
    </group>
  );
}

function WardrobeComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color, details } = item;
  const hasDrawers = details?.hasDrawers ?? true;

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, dimensions.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Doors */}
      <mesh position={[0, dimensions.height / 2, dimensions.depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[dimensions.width - 0.1, dimensions.height - 0.1, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Door handles */}
      <mesh
        position={[-0.3, dimensions.height / 2, dimensions.depth / 2 + 0.08]}
        castShadow
      >
        <boxGeometry args={[0.08, 0.5, 0.05]} />
        <meshStandardMaterial color="#B0B0B0" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh
        position={[0.3, dimensions.height / 2, dimensions.depth / 2 + 0.08]}
        castShadow
      >
        <boxGeometry args={[0.08, 0.5, 0.05]} />
        <meshStandardMaterial color="#B0B0B0" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Bottom drawers */}
      {hasDrawers && (
        <group position={[0, 0.4, dimensions.depth / 2 + 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[dimensions.width - 0.15, 0.6, 0.05]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* Drawer handle */}
          <mesh position={[0, 0, 0.05]} castShadow>
            <boxGeometry args={[0.6, 0.08, 0.05]} />
            <meshStandardMaterial color="#B0B0B0" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function NightstandComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color, details } = item;
  const numDrawers = details?.numberOfDrawers ?? 2;

  return (
    <group>
      {/* Top */}
      <mesh position={[0, dimensions.height - 0.05, 0]} castShadow>
        <boxGeometry args={[dimensions.width, 0.1, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Body */}
      <mesh position={[0, dimensions.height / 2, 0]} castShadow>
        <boxGeometry
          args={[dimensions.width - 0.05, dimensions.height - 0.1, dimensions.depth - 0.05]}
        />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Drawers */}
      {Array.from({ length: numDrawers }).map((_, i) => {
        const drawerHeight = (dimensions.height - 0.2) / numDrawers;
        const y = 0.1 + drawerHeight * (i + 0.5);
        return (
          <group key={i} position={[0, y, dimensions.depth / 2 + 0.02]}>
            <mesh castShadow>
              <boxGeometry
                args={[dimensions.width - 0.15, drawerHeight - 0.05, 0.05]}
              />
              <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Handle */}
            <mesh position={[0, 0, 0.05]} castShadow>
              <boxGeometry args={[0.3, 0.06, 0.04]} />
              <meshStandardMaterial color="#B0B0B0" roughness={0.3} metalness={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <mesh
          key={i}
          position={[
            (dimensions.width / 2 - 0.1) * x,
            0.1,
            (dimensions.depth / 2 - 0.1) * z,
          ]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function BookshelfComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color, details } = item;
  const numShelves = details?.numberOfShelves ?? 4;

  return (
    <group>
      {/* Frame - sides */}
      <mesh position={[-dimensions.width / 2 + 0.05, dimensions.height / 2, 0]} castShadow>
        <boxGeometry args={[0.1, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[dimensions.width / 2 - 0.05, dimensions.height / 2, 0]} castShadow>
        <boxGeometry args={[0.1, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Back */}
      <mesh position={[0, dimensions.height / 2, -dimensions.depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[dimensions.width - 0.1, dimensions.height, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Shelves */}
      {Array.from({ length: numShelves + 1 }).map((_, i) => {
        const y = (dimensions.height / (numShelves + 1)) * i + 0.05;
        return (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[dimensions.width - 0.1, 0.08, dimensions.depth - 0.05]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function SofaComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color } = item;

  return (
    <group>
      {/* Base/Seat */}
      <mesh position={[0, dimensions.height * 0.3, 0]} castShadow>
        <boxGeometry args={[dimensions.width, dimensions.height * 0.4, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Backrest */}
      <mesh
        position={[0, dimensions.height * 0.6, -dimensions.depth / 2 + 0.2]}
        castShadow
      >
        <boxGeometry args={[dimensions.width, dimensions.height * 0.5, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Armrests */}
      <mesh
        position={[-dimensions.width / 2 + 0.15, dimensions.height * 0.45, 0]}
        castShadow
      >
        <boxGeometry args={[0.3, dimensions.height * 0.5, dimensions.depth - 0.2]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh
        position={[dimensions.width / 2 - 0.15, dimensions.height * 0.45, 0]}
        castShadow
      >
        <boxGeometry args={[0.3, dimensions.height * 0.5, dimensions.depth - 0.2]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Cushions */}
      <mesh position={[0, dimensions.height * 0.55, 0.05]} castShadow>
        <boxGeometry
          args={[dimensions.width - 0.4, 0.2, dimensions.depth - 0.4]}
        />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

function TableComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color } = item;

  return (
    <group>
      {/* Tabletop */}
      <mesh position={[0, dimensions.height - 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[dimensions.width, 0.1, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <mesh
          key={i}
          position={[
            (dimensions.width / 2 - 0.15) * x,
            (dimensions.height - 0.1) / 2,
            (dimensions.depth / 2 - 0.15) * z,
          ]}
          castShadow
        >
          <boxGeometry args={[0.1, dimensions.height - 0.1, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function DresserComponent({ item }: { item: FurnitureItem }) {
  const { dimensions, color, details } = item;
  const numDrawers = details?.numberOfDrawers ?? 4;

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, dimensions.height / 2, 0]} castShadow>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Drawers */}
      {Array.from({ length: numDrawers }).map((_, i) => {
        const drawerHeight = (dimensions.height - 0.1) / numDrawers;
        const y = 0.05 + drawerHeight * (i + 0.5);
        return (
          <group key={i} position={[0, y, dimensions.depth / 2 + 0.02]}>
            <mesh castShadow>
              <boxGeometry
                args={[dimensions.width - 0.1, drawerHeight - 0.03, 0.04]}
              />
              <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Handles */}
            <mesh position={[-0.4, 0, 0.04]} castShadow>
              <boxGeometry args={[0.25, 0.06, 0.04]} />
              <meshStandardMaterial color="#B0B0B0" roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[0.4, 0, 0.04]} castShadow>
              <boxGeometry args={[0.25, 0.06, 0.04]} />
              <meshStandardMaterial color="#B0B0B0" roughness={0.3} metalness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============================================================
// Furniture Factory
// ============================================================

function FurnitureFactory({ item }: { item: FurnitureItem }) {
  const rotation: [number, number, number] = [0, (item.rotation * Math.PI) / 180, 0];
  const position: [number, number, number] = [item.position.x, 0, item.position.z];

  let Component: React.FC<{ item: FurnitureItem }>;

  switch (item.type) {
    case "bed":
      Component = BedComponent;
      break;
    case "desk":
      Component = DeskComponent;
      break;
    case "chair":
      Component = ChairComponent;
      break;
    case "wardrobe":
    case "cabinet":
      Component = WardrobeComponent;
      break;
    case "nightstand":
      Component = NightstandComponent;
      break;
    case "bookshelf":
    case "shelf":
      Component = BookshelfComponent;
      break;
    case "sofa":
    case "ottoman":
    case "bench":
      Component = SofaComponent;
      break;
    case "table":
    case "tv-stand":
      Component = TableComponent;
      break;
    case "dresser":
      Component = DresserComponent;
      break;
    default:
      // Default box representation
      return (
        <group position={position} rotation={rotation}>
          <mesh position={[0, item.dimensions.height / 2, 0]} castShadow>
            <boxGeometry
              args={[item.dimensions.width, item.dimensions.height, item.dimensions.depth]}
            />
            <meshStandardMaterial color={item.color} roughness={0.6} />
          </mesh>
        </group>
      );
  }

  return (
    <group position={position} rotation={rotation}>
      <Component item={item} />
    </group>
  );
}

// ============================================================
// Lighting Setup
// ============================================================

interface LightingSetupProps {
  naturalLight: string;
  fixtures: LightingFixture[];
  roomHeight: number;
}

function LightingSetup({ naturalLight, fixtures, roomHeight }: LightingSetupProps) {
  const ambientIntensity =
    naturalLight === "bright" ? 0.6 : naturalLight === "moderate" ? 0.4 : 0.2;

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#FFF8E7" />
      
      {/* Main ceiling light */}
      <pointLight
        position={[0, roomHeight - 0.5, 0]}
        intensity={1.5}
        color="#FFF5E6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Additional fixtures */}
      {fixtures.map((fixture, i) => {
        switch (fixture.type) {
          case "ceiling":
            return (
              <group key={i}>
                <pointLight
                  position={[fixture.position.x, fixture.position.y, fixture.position.z]}
                  intensity={1.2}
                  color="#FFF5E6"
                />
                {/* Light fixture model */}
                <mesh position={[fixture.position.x, fixture.position.y, fixture.position.z]}>
                  <sphereGeometry args={[0.3, 16, 16]} />
                  <meshStandardMaterial
                    color="#FFFFF0"
                    emissive="#FFFFF0"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              </group>
            );
          case "desk-lamp":
            return (
              <pointLight
                key={i}
                position={[fixture.position.x, fixture.position.y, fixture.position.z]}
                intensity={0.5}
                color="#FFF8DC"
                distance={5}
              />
            );
          case "floor-lamp":
            return (
              <pointLight
                key={i}
                position={[fixture.position.x, fixture.position.y, fixture.position.z]}
                intensity={0.8}
                color="#FFF8DC"
                distance={8}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

// ============================================================
// Auto Rotate Controller
// ============================================================

interface AutoRotateControllerProps {
  enabled: boolean;
  controlsRef: React.RefObject<any>;
}

function AutoRotateController({ enabled, controlsRef }: AutoRotateControllerProps) {
  const lastInteraction = useRef(Date.now());
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useFrame(() => {
    if (controlsRef.current) {
      // Check if user has stopped interacting for 2 seconds
      const timeSinceInteraction = Date.now() - lastInteraction.current;
      
      if (isUserInteracting && timeSinceInteraction > 100) {
        setIsUserInteracting(false);
      }

      // Enable/disable auto-rotate based on interaction
      controlsRef.current.autoRotate = enabled && !isUserInteracting && timeSinceInteraction > 2000;
    }
  });

  // Listen for user interaction
  useEffect(() => {
    const handleInteraction = () => {
      lastInteraction.current = Date.now();
      setIsUserInteracting(true);
    };

    window.addEventListener("mousedown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("wheel", handleInteraction);

    return () => {
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("wheel", handleInteraction);
    };
  }, []);

  return null;
}

// ============================================================
// Loading Component
// ============================================================

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-sm">Loading 3D model...</p>
      </div>
    </Html>
  );
}

// ============================================================
// Main Scene Component
// ============================================================

interface RoomSceneProps {
  roomData: AIRoomData;
  autoRotate: boolean;
  showGrid: boolean;
}

function RoomScene({ roomData, autoRotate, showGrid }: RoomSceneProps) {
  const controlsRef = useRef<any>(null);
  const { room, windows, furniture, lighting } = roomData;

  // Calculate camera position based on room size
  const maxDim = Math.max(room.dimensions.length, room.dimensions.width);
  const cameraDistance = maxDim * 1.5;

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[cameraDistance, cameraDistance * 0.6, cameraDistance]}
        fov={65}
      />

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={maxDim * 2.5}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, room.dimensions.height / 3, 0]}
      />

      {/* Auto-rotate controller */}
      <AutoRotateController enabled={autoRotate} controlsRef={controlsRef} />

      {/* Lighting */}
      <LightingSetup
        naturalLight={lighting.naturalLight}
        fixtures={lighting.fixtures}
        roomHeight={room.dimensions.height}
      />

      {/* Environment for reflections */}
      <Environment preset="apartment" />

      {/* Room Structure */}
      <RoomStructure
        dimensions={room.dimensions}
        wallColor={room.walls.color}
        floorColor={room.floor.color}
        ceilingColor={room.ceiling.color}
        floorMaterial={room.floor.material}
      />

      {/* Windows */}
      {windows.map((window, i) => (
        <WindowComponent
          key={i}
          spec={window}
          roomDimensions={{ length: room.dimensions.length, width: room.dimensions.width }}
        />
      ))}

      {/* Furniture */}
      {furniture.map((item, i) => (
        <FurnitureFactory key={item.id || i} item={item} />
      ))}

      {/* Optional grid */}
      {showGrid && (
        <gridHelper
          args={[Math.max(room.dimensions.length, room.dimensions.width) * 2, 20, "#444", "#333"]}
          position={[0, 0.01, 0]}
        />
      )}
    </>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function DynamicRoomViewer({
  roomData,
  autoRotate = true,
  showGrid = false,
  onLoadComplete,
}: DynamicRoomViewerProps) {
  useEffect(() => {
    // Notify when component mounts (scene loaded)
    onLoadComplete?.();
  }, [onLoadComplete]);

  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0a0a0f");
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <RoomScene
            roomData={roomData}
            autoRotate={autoRotate}
            showGrid={showGrid}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
