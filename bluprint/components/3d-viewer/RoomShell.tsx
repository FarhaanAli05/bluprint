"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";

// Room dimensions
const ROOM = {
  width: 12,
  depth: 10,
  height: 9,
  wallThickness: 0.3,
  baseboardHeight: 0.15, // Reduced height
  baseboardThickness: 0.08, // Thickness away from wall
};

interface RoomShellProps {
  useTextures?: boolean;
  blueprintMode?: boolean;
  debugMode?: "normal" | "wireframe" | "depth";
  showBoundingBoxes?: boolean;
}

// Create wall texture
function createWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#F5F5F0";
  ctx.fillRect(0, 0, 256, 256);
  const imageData = ctx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 4;
    imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
    imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
    imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Create floor texture
function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#C4A35A";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 512; i += 4) {
    const variation = Math.sin(i * 0.1) * 8;
    ctx.strokeStyle = `rgba(${196 - variation}, ${163 - variation}, ${90 - variation}, 0.2)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i + variation);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(ROOM.width / 2, ROOM.depth / 2);
  return texture;
}

export function Floor({ useTextures, debugMode }: RoomShellProps) {
  const floorTexture = useMemo(() => useTextures ? createFloorTexture() : null, [useTextures]);
  
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: floorTexture || undefined,
      color: "#C4A35A",
      roughness: 0.7, // More matte
      metalness: 0.0, // No metalness
    });
    if (debugMode === "wireframe") {
      mat.wireframe = true;
    }
    return mat;
  }, [floorTexture, debugMode]);

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      receiveShadow
    >
      <planeGeometry args={[ROOM.width, ROOM.depth, 20, 20]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function Walls({ useTextures, blueprintMode, debugMode }: RoomShellProps) {
  const wallTexture = useMemo(() => useTextures ? createWallTexture() : null, [useTextures]);
  
  const wallMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: wallTexture || undefined,
      color: blueprintMode ? "#1e3a8a" : "#F5F5F0",
      roughness: 0.95, // Very matte
      metalness: 0.0,
    });
    if (debugMode === "wireframe") {
      mat.wireframe = true;
    }
    return mat;
  }, [wallTexture, blueprintMode, debugMode]);

  return (
    <group>
      {/* Back wall */}
      <mesh 
        position={[0, ROOM.height / 2, -ROOM.depth / 2]} 
        receiveShadow
        castShadow
      >
        <boxGeometry args={[ROOM.width, ROOM.height, ROOM.wallThickness]} />
        <primitive object={wallMaterial.clone()} attach="material" />
        {blueprintMode && <Edges color="#3b82f6" threshold={15} />}
      </mesh>
      
      {/* Left wall */}
      <mesh 
        position={[-ROOM.width / 2, ROOM.height / 2, 0]} 
        receiveShadow
        castShadow
      >
        <boxGeometry args={[ROOM.wallThickness, ROOM.height, ROOM.depth]} />
        <primitive object={wallMaterial.clone()} attach="material" />
        {blueprintMode && <Edges color="#3b82f6" threshold={15} />}
      </mesh>
      
      {/* Right wall */}
      <mesh 
        position={[ROOM.width / 2, ROOM.height / 2, 0]} 
        receiveShadow
        castShadow
      >
        <boxGeometry args={[ROOM.wallThickness, ROOM.height, ROOM.depth]} />
        <primitive object={wallMaterial.clone()} attach="material" />
        {blueprintMode && <Edges color="#3b82f6" threshold={15} />}
      </mesh>
      
      {/* Front wall (partial) */}
      <mesh 
        position={[0, ROOM.height / 2, ROOM.depth / 2]} 
        receiveShadow
      >
        <boxGeometry args={[ROOM.width, ROOM.height, ROOM.wallThickness]} />
        <meshStandardMaterial 
          color={blueprintMode ? "#1e3a8a" : "#F5F5F0"} 
          transparent 
          opacity={0.3}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}

export function Baseboards({ blueprintMode, debugMode }: RoomShellProps) {
  const baseboardMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: blueprintMode ? "#1e3a8a" : "#1A1A1A",
      roughness: 0.8,
      metalness: 0.0,
    });
    if (debugMode === "wireframe") {
      mat.wireframe = true;
    }
    return mat;
  }, [blueprintMode, debugMode]);

  // Baseboard Y position - sits on floor, extends upward (lifted slightly to avoid z-fighting)
  const baseboardY = ROOM.baseboardHeight / 2 + 0.005;

  // CRITICAL FIX: Baseboards are positioned to avoid coplanar overlap
  // Strategy: Position baseboards so they sit ON the floor and AGAINST the wall inner face
  // The baseboard extends INTO the room by baseboardThickness, but its BACK face is flush with wall inner face
  
  // Wall inner face positions:
  const backWallInnerZ = -ROOM.depth / 2 + ROOM.wallThickness / 2;
  const leftWallInnerX = -ROOM.width / 2 + ROOM.wallThickness / 2;
  const rightWallInnerX = ROOM.width / 2 - ROOM.wallThickness / 2;
  const baseboardInset = 0.01;
  
  return (
    <group>
      {/* Back baseboard - back face flush with wall inner face, extends into room */}
      <mesh 
        position={[
          0, 
          baseboardY, 
          backWallInnerZ + ROOM.baseboardThickness / 2 + baseboardInset // Center is forward from wall inner face
        ]} 
        castShadow
      >
        <boxGeometry args={[
          ROOM.width - 0.2, // Slightly inset from corners to avoid overlap
          ROOM.baseboardHeight, 
          ROOM.baseboardThickness
        ]} />
        <primitive object={baseboardMaterial} attach="material" />
        {blueprintMode && <Edges color="#3b82f6" threshold={15} />}
      </mesh>
      
      {/* Left baseboard - inner face flush with wall inner face, extends into room */}
      <mesh 
        position={[
          leftWallInnerX + ROOM.baseboardThickness / 2 + baseboardInset, // Center is inward from wall inner face
          baseboardY, 
          0
        ]} 
        castShadow
      >
        <boxGeometry args={[
          ROOM.baseboardThickness, 
          ROOM.baseboardHeight, 
          ROOM.depth - 0.2 // Slightly shorter to avoid corner overlap
        ]} />
        <primitive object={baseboardMaterial.clone()} attach="material" />
        {blueprintMode && <Edges color="#3b82f6" threshold={15} />}
      </mesh>
      
      {/* Right baseboard - inner face flush with wall inner face, extends into room */}
      <mesh 
        position={[
          rightWallInnerX - ROOM.baseboardThickness / 2 - baseboardInset, // Center is inward from wall inner face
          baseboardY, 
          0
        ]} 
        castShadow
      >
        <boxGeometry args={[
          ROOM.baseboardThickness, 
          ROOM.baseboardHeight, 
          ROOM.depth - 0.2 // Slightly shorter to avoid corner overlap
        ]} />
        <primitive object={baseboardMaterial.clone()} attach="material" />
        {blueprintMode && <Edges color="#3b82f6" threshold={15} />}
      </mesh>
    </group>
  );
}

export function Ceiling() {
  return (
    <group>
      <mesh position={[0, ROOM.height + 0.1, 0]} receiveShadow>
        <boxGeometry args={[ROOM.width, 0.2, ROOM.depth]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.95} metalness={0.0} />
      </mesh>
    </group>
  );
}
