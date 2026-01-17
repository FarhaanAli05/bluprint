"use client";

import { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Grid,
  Environment,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import type { Dimensions, Materials, PlacedFurniture, CameraMode } from "@/types/room.types";
import { createFurnitureFromSpec, type AIFurnitureItem } from "@/lib/furnitureFactory";

interface RoomViewerProps {
  dimensions: Dimensions;
  materials: Materials;
  furniture: PlacedFurniture[];
  cameraMode: CameraMode;
  showGrid: boolean;
  showMeasurements: boolean;
  selectedFurnitureId: string | null;
  onFurnitureSelect: (id: string | null) => void;
}

// Convert feet/meters to Three.js units (1 unit = 1 foot)
function toUnits(value: number, unit: "feet" | "meters"): number {
  return unit === "meters" ? value * 3.28084 : value;
}

// Room geometry component
function Room({
  dimensions,
  materials,
}: {
  dimensions: Dimensions;
  materials: Materials;
}) {
  const length = toUnits(dimensions.length, dimensions.unit);
  const width = toUnits(dimensions.width, dimensions.unit);
  const height = toUnits(dimensions.height, dimensions.unit);

  // Create wall material with subtle lighting response
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: materials.wallColor,
        roughness: 0.9,
        metalness: 0,
        side: THREE.BackSide,
      }),
    [materials.wallColor]
  );

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: materials.floorColor,
        roughness: 0.8,
        metalness: 0.1,
      }),
    [materials.floorColor]
  );

  const ceilingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: materials.ceilingColor,
        roughness: 0.9,
        metalness: 0,
      }),
    [materials.ceilingColor]
  );

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[length, width]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, 0]}
        receiveShadow
      >
        <planeGeometry args={[length, width]} />
        <primitive object={ceilingMaterial} attach="material" />
      </mesh>

      {/* North wall (back) */}
      <mesh position={[0, height / 2, -width / 2]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <primitive object={wallMaterial.clone()} attach="material" />
      </mesh>

      {/* South wall (front) */}
      <mesh
        rotation={[0, Math.PI, 0]}
        position={[0, height / 2, width / 2]}
        receiveShadow
      >
        <planeGeometry args={[length, height]} />
        <primitive object={wallMaterial.clone()} attach="material" />
      </mesh>

      {/* East wall (right) */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[length / 2, height / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
        <primitive object={wallMaterial.clone()} attach="material" />
      </mesh>

      {/* West wall (left) */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-length / 2, height / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
        <primitive object={wallMaterial.clone()} attach="material" />
      </mesh>

      {/* Baseboard trim */}
      <group>
        {[
          { pos: [0, 0.15, -width / 2 + 0.05], rot: [0, 0, 0], size: [length, 0.3] },
          { pos: [0, 0.15, width / 2 - 0.05], rot: [0, Math.PI, 0], size: [length, 0.3] },
          { pos: [length / 2 - 0.05, 0.15, 0], rot: [0, -Math.PI / 2, 0], size: [width, 0.3] },
          { pos: [-length / 2 + 0.05, 0.15, 0], rot: [0, Math.PI / 2, 0], size: [width, 0.3] },
        ].map((trim, i) => (
          <mesh
            key={i}
            position={trim.pos as [number, number, number]}
            rotation={trim.rot as [number, number, number]}
          >
            <planeGeometry args={trim.size as [number, number]} />
            <meshStandardMaterial color="#e0dcd8" roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Measurement labels
function Measurements({
  dimensions,
  show,
}: {
  dimensions: Dimensions;
  show: boolean;
}) {
  if (!show) return null;

  const length = toUnits(dimensions.length, dimensions.unit);
  const width = toUnits(dimensions.width, dimensions.unit);
  const height = toUnits(dimensions.height, dimensions.unit);
  const unit = dimensions.unit === "feet" ? "ft" : "m";

  return (
    <group>
      {/* Length label */}
      <Text
        position={[0, 0.1, width / 2 + 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#60a5fa"
        anchorX="center"
        anchorY="middle"
      >
        {`${dimensions.length} ${unit}`}
      </Text>

      {/* Width label */}
      <Text
        position={[length / 2 + 1, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.5}
        color="#60a5fa"
        anchorX="center"
        anchorY="middle"
      >
        {`${dimensions.width} ${unit}`}
      </Text>

      {/* Height label */}
      <Text
        position={[-length / 2 - 0.5, height / 2, -width / 2 - 0.5]}
        rotation={[0, Math.PI / 4, 0]}
        fontSize={0.5}
        color="#60a5fa"
        anchorX="center"
        anchorY="middle"
      >
        {`${dimensions.height} ${unit}`}
      </Text>
    </group>
  );
}

// AI Furniture mesh using furniture factory
function AIFurnitureMesh({
  item,
  isSelected,
  onClick,
  roomDimensions,
}: {
  item: PlacedFurniture;
  isSelected: boolean;
  onClick: () => void;
  roomDimensions: { length: number; width: number };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [furnitureGroup, setFurnitureGroup] = useState<THREE.Group | null>(null);

  // Create the furniture geometry
  useEffect(() => {
    const aiItem: AIFurnitureItem = {
      id: item.id,
      name: item.name,
      modelUrl: "",
      position: [item.position.x, item.position.y, item.position.z],
      rotation: [0, item.rotation, 0],
      scale: [1, 1, 1],
      color: item.color,
      dimensions: item.dimensions,
      furnitureType: item.furnitureType || item.category,
      material: item.material,
      details: item.details,
    };
    
    const group = createFurnitureFromSpec(aiItem);
    setFurnitureGroup(group);

    return () => {
      // Cleanup
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, [item]);

  // Animate selection
  useFrame(() => {
    if (groupRef.current && isSelected) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.05;
    } else if (groupRef.current) {
      groupRef.current.position.y = 0;
    }
  });

  if (!furnitureGroup) return null;

  // Calculate position relative to room center
  const posX = item.position.x - roomDimensions.length / 2;
  const posZ = item.position.z - roomDimensions.width / 2;

  return (
    <group
      ref={groupRef}
      position={[posX, 0, posZ]}
      rotation={[0, item.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <primitive object={furnitureGroup} />
      {isSelected && (
        <mesh position={[0, item.dimensions.height / 2, 0]}>
          <boxGeometry
            args={[
              item.dimensions.width + 0.2,
              item.dimensions.height + 0.2,
              item.dimensions.depth + 0.2,
            ]}
          />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// Basic furniture placeholder mesh (for non-AI furniture)
function FurnitureMesh({
  item,
  isSelected,
  onClick,
}: {
  item: PlacedFurniture;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate selection
  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y =
        item.position.y + Math.sin(Date.now() * 0.003) * 0.05;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[item.position.x, item.position.y + item.dimensions.height / 2, item.position.z]}
      rotation={[0, item.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry
        args={[item.dimensions.width, item.dimensions.height, item.dimensions.depth]}
      />
      <meshStandardMaterial
        color={item.color || "#6b7280"}
        roughness={0.7}
        metalness={0.1}
        emissive={isSelected ? "#3b82f6" : "#000000"}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
      {isSelected && (
        <lineSegments>
          <edgesGeometry
            args={[
              new THREE.BoxGeometry(
                item.dimensions.width + 0.1,
                item.dimensions.height + 0.1,
                item.dimensions.depth + 0.1
              ),
            ]}
          />
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}

// Camera controller for different modes
function CameraController({ mode }: { mode: CameraMode }) {
  const { camera } = useThree();

  useFrame(() => {
    if (mode === "topDown") {
      // Top-down view adjustments handled by OrbitControls
    }
  });

  return null;
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1e293b" wireframe />
    </mesh>
  );
}

export default function RoomViewer({
  dimensions,
  materials,
  furniture,
  cameraMode,
  showGrid,
  showMeasurements,
  selectedFurnitureId,
  onFurnitureSelect,
}: RoomViewerProps) {
  const length = toUnits(dimensions.length, dimensions.unit);
  const width = toUnits(dimensions.width, dimensions.unit);
  const height = toUnits(dimensions.height, dimensions.unit);

  // Calculate camera position based on room size
  const cameraDistance = Math.max(length, width) * 1.5;
  const cameraHeight = cameraMode === "topDown" ? Math.max(length, width) * 2 : height * 0.8;

  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => onFurnitureSelect(null)}
      >
        <color attach="background" args={["#0f172a"]} />
        
        <PerspectiveCamera
          makeDefault
          position={[
            cameraMode === "topDown" ? 0 : cameraDistance * 0.7,
            cameraHeight,
            cameraMode === "topDown" ? 0.01 : cameraDistance * 0.7,
          ]}
          fov={50}
        />

        <CameraController mode={cameraMode} />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate={cameraMode !== "topDown"}
          maxPolarAngle={cameraMode === "topDown" ? 0 : Math.PI / 2 - 0.1}
          minPolarAngle={cameraMode === "topDown" ? 0 : 0.1}
          target={[0, height / 3, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[length / 2, height * 2, width / 2]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[0, height - 0.5, 0]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          {/* Room geometry */}
          <Room dimensions={dimensions} materials={materials} />

          {/* Grid */}
          {showGrid && (
            <Grid
              position={[0, 0.01, 0]}
              args={[Math.max(length, width) * 2, Math.max(length, width) * 2]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#334155"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#475569"
              fadeDistance={50}
              fadeStrength={1}
              followCamera={false}
            />
          )}

          {/* Measurements */}
          <Measurements dimensions={dimensions} show={showMeasurements} />

          {/* Furniture */}
          {furniture.map((item) => {
            // Use AI furniture mesh for items with furnitureType
            if (item.furnitureType) {
              return (
                <AIFurnitureMesh
                  key={item.id}
                  item={item}
                  isSelected={selectedFurnitureId === item.id}
                  onClick={() => onFurnitureSelect(item.id)}
                  roomDimensions={{ length, width }}
                />
              );
            }
            return (
              <FurnitureMesh
                key={item.id}
                item={item}
                isSelected={selectedFurnitureId === item.id}
                onClick={() => onFurnitureSelect(item.id)}
              />
            );
          })}

          {/* Environment lighting */}
          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </div>
  );
}
