"use client";

import * as THREE from "three";

interface LightingRigProps {
  shadowsEnabled?: boolean;
}

export function LightingRig({ shadowsEnabled = true }: LightingRigProps) {
  return (
    <>
      {/* Ambient light - low intensity */}
      <ambientLight intensity={0.25} color="#ffffff" />
      
      {/* Hemisphere light - natural bounce */}
      <hemisphereLight
        intensity={0.35}
        color="#87CEEB"
        groundColor="#8B7355"
      />
      
      {/* Main directional light - key light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.0}
        castShadow={shadowsEnabled}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      
      {/* Fill light from window */}
      <directionalLight
        position={[2, 5, -8]}
        intensity={0.4}
        color="#87CEEB"
      />
      
      {/* Rim light */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.25}
        color="#ffffff"
      />
    </>
  );
}
